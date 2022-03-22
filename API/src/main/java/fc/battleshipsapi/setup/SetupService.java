package fc.battleshipsapi.setup;

import fc.battleshipsapi.game.*;
import fc.battleshipsapi.ki.KIProperties;
import fc.battleshipsapi.player.MatchRequest;
import fc.battleshipsapi.player.Player;
import fc.battleshipsapi.player.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class SetupService {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private BoardService boardService;

    @Autowired
    private GameService gameService;

    public Game createSingleplayerGame() {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return null;
        Game game = new Game();
        game.setPlayer1(player.getUsername());
        Player enemy = playerService.getPlayerById(KIProperties.ID);
        if (enemy == null) return null;
        game.setPlayer2(enemy.getUsername());
        Board playerBoard = boardService.createEmptyBoard();
        game.setBoard1(playerBoard);
        Board enemyBoard = boardService.createRandomBoard();
        game.setBoard2(enemyBoard);
        game.setTurn(getRandomTurn(player.getUsername(), enemy.getUsername()));
        game.setState(State.SETUP);
        game.setStartedAt(ZonedDateTime.now(ZoneId.of("Europe/Paris")));
        return gameService.finalizeGame(game, player, enemy);
    }

    public Game placeShips(SetupRequest request) {
        Player player = playerService.getPlayerFromAuth();
        Game game = gameService.getActiveUnfinalized(request);
        if (game == null || player == null) return null;
        Board board = player.getUsername().equals(game.getPlayer1()) ? game.getBoard1() : game.getBoard2();
        if (boardService.validateShips(request.getShips())) {
            boardService.positionShips(board, request.getShips());
            board.setValid(true);
            Board board2 = player.getUsername().equals(game.getPlayer1()) ? game.getBoard2() : game.getBoard1();
            if (board2.isValid()) {
                game.setState(State.STARTED);
            }
            return gameService.finalizeGame(game, player, null);
        }
        return null;
    }

    private String getRandomTurn(String player1, String player2) {
        int rand = ThreadLocalRandom.current().nextInt(0, 2);
        return (rand == 0) ? player1 : player2;
    }

    public String acceptMatch(MatchRequest request) {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return null;
        Player enemy = playerService.getPlayerByUsername(request.getTarget());
        if (enemy == null) return null;
        MatchRequest success = null;
        String id = null;
        for (MatchRequest openRequest: player.getOpenRequests()) {
            if (openRequest.getChallenger().equals(request.getTarget())) {
                Game game = new Game();
                game.setPlayer1(player.getUsername());
                game.setPlayer2(enemy.getUsername());
                Board playerBoard = boardService.createEmptyBoard();
                game.setBoard1(playerBoard);
                Board enemyBoard = boardService.createEmptyBoard();
                game.setBoard2(enemyBoard);
                game.setTurn(getRandomTurn(player.getUsername(), enemy.getUsername()));
                game.setState(State.SETUP);
                game.setStartedAt(ZonedDateTime.now(ZoneId.of("Europe/Paris")));
                gameService.finalizeGame(game, player, enemy);
                success = openRequest;
                id = game.getId();
            }
        }
        if (success != null) {
            player.getOpenRequests().remove(success);
            playerService.save(player);
            MatchRequest enemyRequest = null;
            for (MatchRequest sentRequest: enemy.getSentRequests()) {
                if (sentRequest.getTarget().equals(player.getUsername())) {
                    enemyRequest = sentRequest;
                }
            }
            if (enemyRequest != null) {
                enemy.getSentRequests().remove(enemyRequest);
                playerService.save(enemy);
            }
            return id;
        }
        return null;
    }

    public boolean declineMatch(MatchRequest request) {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return false;
        Player enemy = playerService.getPlayerByUsername(request.getTarget());
        if (enemy == null) return false;
        deleteMatchForPlayers(enemy, player);
        return true;
    }

    public boolean deleteMatch(MatchRequest request) {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return false;
        Player enemy = playerService.getPlayerByUsername(request.getTarget());
        if (enemy == null) return false;
        deleteMatchForPlayers(player, enemy);
        return true;
    }

    private void deleteMatchForPlayers(Player challenger, Player target) {
        MatchRequest sentRequest = null;
        for (MatchRequest request: challenger.getSentRequests()) {
            if (request.getTarget().equals(target.getUsername())) {
                sentRequest = request;
            }
        }
        if (sentRequest != null) {
            challenger.getSentRequests().remove(sentRequest);
            playerService.save(challenger);
        }
        MatchRequest openRequest = null;
        for (MatchRequest request: target.getOpenRequests()) {
            if (request.getChallenger().equals(challenger.getUsername())) {
                openRequest = request;
            }
        }
        if (openRequest != null) {
            target.getOpenRequests().remove(openRequest);
            playerService.save(target);
        }
    }

}
