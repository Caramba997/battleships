package fc.battleshipsapi.ki;

import fc.battleshipsapi.game.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
public class KIService {

    private final int DIRECTION_UP = 0;
    private final int DIRECTION_RIGHT = 1;
    private final int DIRECTION_DOWN = 2;
    private final int DIRECTION_LEFT = 3;

    public void makeMove(Game game) {
        Field[][] board = game.getBoard1().getBoard();
        boolean turn = true;
        while (turn) {
            Coordinate next;
            Coordinate hit = findHit(board);
            if (hit != null) {
                next = findNextShoot(board, hit);
            }
            else {
                next = findRandomShoot(board);
            }
            turn = shoot(game, next);
        }
    }
    
    private boolean shoot(Game game, Coordinate coord) {
        Board board = game.getBoard1();
        Field field = board.getBoard()[coord.getX()][coord.getY()];
        if (field.equals(Field.SHIP)) {
            board.getBoard()[coord.getX()][coord.getY()] = Field.HIT;
            checkShip(board, coord);
            return true;
        }
        board.getBoard()[coord.getX()][coord.getY()] = Field.MISS;
        return false;
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

    private Coordinate findHit(Field[][] board) {
        for (int x = 0; x < 10; x++) {
            for (int y = 0; y < 10; y++) {
                if (board[x][y].equals(Field.HIT)) {
                    return new Coordinate(x, y);
                }
            }
        }
        return null;
    }
    
    private Coordinate findRandomShoot(Field[][] board) {
        Coordinate coord = null;
        while (coord == null) {
            int x = new Random().nextInt(10);
            int y = new Random().nextInt(10);
            coord = checkShootable(board, new Coordinate(x, y));
        }
        return coord;
    }

    private Coordinate findNextShoot(Field[][] board, Coordinate hit) {
        int direction = -1;
        for (int i = -1; i <= 1; i += 2) {
            int x = hit.getX() + i;
            if (x < 0 || x >= 10) continue;
            int y = hit.getY();
            if (board[x][y].equals(Field.HIT)) {
                direction = Ship.DIRECTION_HORIZONTAL;
                break;
            }
        }
        if (direction == -1) {
            for (int i = -1; i <= 1; i += 2) {
                int y = hit.getY() + i;
                if (y < 0 || y >= 10) continue;
                int x = hit.getX();
                if (board[x][y].equals(Field.HIT)) {
                    direction = Ship.DIRECTION_VERTICAL;
                    break;
                }
            }
        }
        if (direction == -1) {
            int randomDirection = new Random().nextInt(4);
            List<Integer> directions = new ArrayList<>();
            for (int i = 0; i < 4; i++) {
                directions.add((randomDirection + i) % 4);
            }
            for (int currentDirection: directions) {
                Coordinate coord = checkNeighborShootable(board, hit, currentDirection);
                if (coord != null) return coord;
            }
        }
        else if (direction == Ship.DIRECTION_VERTICAL) {
            int factor = new Random().nextInt(2) * 2 - 1;
            for (int k = 0; k <= 1; k++) {
                Coordinate endOfHitStreak = hit;
                int nextY = hit.getY();
                for (int i = 1; i < 5; i++) {
                    nextY += factor;
                    if (nextY < 0 || nextY >= 10 || !board[hit.getX()][nextY].equals(Field.HIT)) break;
                    endOfHitStreak = new Coordinate(hit.getX(), nextY);
                }
                Coordinate coord = checkNeighborShootable(board, endOfHitStreak, factor + 1);
                if (coord != null) return coord;
                factor *= -1;
            }
        }
        else if (direction == Ship.DIRECTION_HORIZONTAL) {
            int factor = new Random().nextInt(2) * 2 - 1;
            for (int k = 0; k <= 1; k++) {
                Coordinate endOfHitStreak = hit;
                int nextX = hit.getX();
                for (int i = 1; i < 5; i++) {
                    nextX += factor;
                    if (nextX < 0 || nextX >= 10 || !board[nextX][hit.getY()].equals(Field.HIT)) break;
                    endOfHitStreak = new Coordinate(nextX, hit.getY());
                }
                Coordinate coord = checkNeighborShootable(board, endOfHitStreak, factor * -1 + 2);
                if (coord != null) return coord;
                factor *= -1;
            }
        }
        return null;
    }

    private Coordinate checkNeighborShootable(Field[][] board, Coordinate pos, int direction) {
        int x = pos.getX();
        int y = pos.getY();
        switch (direction) {
            case DIRECTION_UP: {
                y--;
                break;
            }
            case DIRECTION_RIGHT: {
                x++;
                break;
            }
            case DIRECTION_DOWN: {
                y++;
                break;
            }
            case DIRECTION_LEFT: {
                x--;
                break;
            }
        }
        return checkShootable(board, new Coordinate(x, y));
    }

    private Coordinate checkShootable(Field[][] board, Coordinate pos) {
        int x = pos.getX();
        int y = pos.getY();
        if (x < 0 || x >= 10 || y < 0 || y >= 10) return null;
        if (!board[x][y].equals(Field.WATER) && !board[x][y].equals(Field.SHIP)) return null;
        for (int ix = -1; ix <= 1; ix++) {
            for (int iy = -1; iy <= 1; iy++) {
                if (x + ix < 0 || x + ix >= 10 || y + iy < 0 || y + iy >= 10) continue;
                if (board[x + ix][y + iy].equals(Field.SUNK)) return null;
            }
        }
        boolean surroundingMisses = true;
        for (int ix = -1; ix <= 1; ix += 2) {
            if (x + ix < 0 || x + ix >= 10) continue;
            if (!board[x + ix][y].equals(Field.MISS)) surroundingMisses = false;
        }
        for (int iy = -1; iy <= 1; iy += 2) {
            if (y + iy < 0 || y + iy >= 10) continue;
            if (!board[x][y + iy].equals(Field.MISS)) surroundingMisses = false;
        }
        if (surroundingMisses) return null;
        return new Coordinate(x, y);
    }
}
