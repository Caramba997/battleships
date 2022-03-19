package fc.battleshipsapi.game;

import fc.battleshipsapi.player.Player;
import fc.battleshipsapi.player.PlayerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PlayerService playerService;

    public void save(Game game) {
        gameRepository.save(game);
    }

    public Game getActive(IdRequest request) {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return null;
        Game active = null;
        for (Game game: player.getActiveGames()) {
            if (game.getId().equals(request.getId())) {
                Optional<Game> optional = gameRepository.findById(game.getId());
                if (optional.isPresent()) active = optional.get();
                active = finalizeGame(active, player, null);
                break;
            }
        }
        return active;
    }

    public Game getActiveUnfinalized(IdRequest request) {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return null;
        Game active = null;
        for (Game game: player.getActiveGames()) {
            if (game.getId().equals(request.getId())) {
                Optional<Game> optional = gameRepository.findById(game.getId());
                if (optional.isPresent()) active = optional.get();
                break;
            }
        }
        return active;
    }

    public Game shoot(ShootRequest request) {
        Player player = playerService.getPlayerFromAuth();
        Game game = getActiveUnfinalized(request);
        if (game == null || player == null) return null;
        if (!game.getState().equals(State.STARTED) || !game.getTurn().equals(player.getUsername())) return null;
        Coordinate coord = request.getCoordinate();
        if (coord.getX() < 0 || coord.getX() >= 10 || coord.getY() < 0 || coord.getY() >= 10) return null;
        Board board = player.getUsername().equals(game.getPlayer1()) ? game.getBoard2() : game.getBoard1();
        Field field = board.getBoard()[coord.getX()][coord.getY()];
        if (field.equals(Field.HIT) || field.equals(Field.MISS) || field.equals(Field.SUNK)) return null;
        if (field.equals(Field.SHIP)) {
            board.getBoard()[coord.getX()][coord.getY()] = Field.HIT;
            checkShip(board, coord);
        }
        else if (field.equals(Field.WATER)) {
            board.getBoard()[coord.getX()][coord.getY()] = Field.MISS;
            game.setTurn(player.getUsername().equals(game.getPlayer1()) ? game.getPlayer2() : game.getPlayer1());
        }
        return finalizeGame(game, player, null);
    }

    private void checkShip(Board board, Coordinate coord) {
        List<Ship> ships = board.getShips();
        Ship target = null;
        for (Ship ship: ships) {
            for (Coordinate shipCoord: ship.getCoordinates()) {
                if (shipCoord.equals(coord)) {
                    target = ship;
                    break;
                }
            }
            if (target != null) break;
        }
        if (target != null) {
            boolean sunk = true;
            for (Coordinate shipCoord: target.getCoordinates()) {
                if (!board.getBoard()[shipCoord.getX()][shipCoord.getY()].equals(Field.HIT)) {
                    sunk = false;
                    break;
                }
            }
            if (sunk == true) {
                for (Coordinate shipCoord: target.getCoordinates()) {
                    board.getBoard()[shipCoord.getX()][shipCoord.getY()] = Field.SUNK;
                }
                target.setSunk(true);
            }
        }
    }

    public Game surrender(IdRequest request) {
        Player player = playerService.getPlayerFromAuth();
        Game game = getActiveUnfinalized(request);
        if (game == null || player == null) return null;
        if (game.getState().equals(State.FINISHED) || game.getState().equals(State.CANCELLED)) return null;
        game.setState(State.CANCELLED);
        game.setWinner(player.getUsername().equals(game.getPlayer1()) ? game.getPlayer2() : game.getPlayer1());
        return finalizeGame(game, player, null);
    }

    public void checkStatus(Game game) {
        if (!game.getState().equals(State.STARTED)) return;
        boolean allSunk = true;
        for (Ship ship: game.getBoard1().getShips()) {
            if (!ship.isSunk()) {
                allSunk = false;
                break;
            }
        }
        if (allSunk) {
            game.setState(State.FINISHED);
            game.setWinner(game.getPlayer2());
            game.setFinishedAt(LocalDateTime.now());
        }
        allSunk = true;
        for (Ship ship: game.getBoard2().getShips()) {
            if (!ship.isSunk()) {
                allSunk = false;
                break;
            }
        }
        if (allSunk) {
            game.setState(State.FINISHED);
            game.setWinner(game.getPlayer1());
            game.setFinishedAt(LocalDateTime.now());
        }
    }

    public Game finalizeGame(Game game, Player player, Player enemy) {
        checkStatus(game);
        save(game);
        Game playerGame = modifyGameForPlayer(game, player);
        Player enemyFixed = enemy;
        if (enemyFixed == null) {
            if (game.getPlayer1().equals(player.getUsername())) {
                enemyFixed = playerService.getPlayerByUsername(game.getPlayer2());
            }
            else {
                enemyFixed = playerService.getPlayerByUsername(game.getPlayer1());
            }
        }
        modifyGameForPlayer(game, enemyFixed);
        return playerGame;
    }

    private Game modifyGameForPlayer(Game game, Player player) {
        Game modifiedGame = new Game(game);
        if (game.getPlayer1().equals(player.getUsername())) {
            modifiedGame.setBoard2(modifyBoardForPlayer(modifiedGame.getBoard2()));
        }
        else {
            Board board2 = modifyBoardForPlayer(modifiedGame.getBoard1());
            modifiedGame.setBoard1(modifiedGame.getBoard2());
            modifiedGame.setBoard2(board2);
            String player2 = modifiedGame.getPlayer1();
            modifiedGame.setPlayer1(modifiedGame.getPlayer2());
            modifiedGame.setPlayer2(player2);
        }
        Game oldGame = null;
        for (Game activeGame: player.getActiveGames()) {
            if (activeGame.getId().equals(game.getId())) {
                oldGame = activeGame;
                break;
            }
        }
        if (oldGame != null) {
            player.getActiveGames().remove(oldGame);
        }
        player.getActiveGames().add(modifiedGame);
        playerService.save(player);
        return modifiedGame;
    }

    private Board modifyBoardForPlayer(Board board) {
        Board modifiedBoard = new Board();
        modifiedBoard.setShips(Collections.emptyList());
        modifiedBoard.setValid(board.isValid());
        Field[][] fields = board.getBoard();
        Field[][] modifiedFields = new Field[10][10];
        for (int x = 0; x < 10; x++) {
            for (int y = 0; y < 10; y++) {
                Field current = fields[x][y];
                switch (current) {
                    case SHIP:
                    case WATER: {
                        modifiedFields[x][y] = Field.UNKNOWN;
                        break;
                    }
                    default: {
                        modifiedFields[x][y] = current;
                        break;
                    }
                }
            }
        }
        modifiedBoard.setBoard(modifiedFields);
        return modifiedBoard;
    }

}
