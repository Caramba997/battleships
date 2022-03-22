package fc.battleshipsapi.game;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
public class BoardService {

    public Board createEmptyBoard() {
        Board board = new Board();
        board.setBoard(new Field[10][10]);
        for (Field[] array : board.getBoard()) {
            Arrays.fill(array, Field.WATER);
        }
        board.setShips(createShips());
        board.setValid(false);
        return board;
    }

    public Board createRandomBoard() {
        Board board = createEmptyBoard();
        positionShipsRandom(board);
        return board;
    }

    private List<Ship> createShips() {
        List<Ship> ships = new ArrayList<>();
        ships.add(new Ship("5_1", Ship.TYPE_5));
        ships.add(new Ship("4_1", Ship.TYPE_4));
        ships.add(new Ship("3_1", Ship.TYPE_3));
        ships.add(new Ship("3_2", Ship.TYPE_3));
        ships.add(new Ship("2_1", Ship.TYPE_2));
        ships.add(new Ship("2_2", Ship.TYPE_2));
        ships.add(new Ship("2_3", Ship.TYPE_2));
        ships.add(new Ship("2_4", Ship.TYPE_2));
        return ships;
    }

    private void positionShipsRandom(Board board) {
        List<Ship> validShips = new ArrayList<>();
        for (Ship ship: board.getShips()) {
            boolean valid = false;
            while (!valid) {
                Coordinate start = getRandomCoordinate();
                int direction = getRandomDirection();
                ship.setDirection(direction);
                int length = ship.getLength();
                if (direction == Ship.DIRECTION_HORIZONTAL && start.getX() + length - 1 >= 10) continue;
                if (direction == Ship.DIRECTION_VERTICAL && start.getY() + length - 1 >= 10) continue;
                calcShipCoordinates(ship, start);
                List<Ship> checkShips = new ArrayList<>(validShips);
                checkShips.add(ship);
                if (validateShips(checkShips)) valid = true;
            }
            validShips.add(ship);
        }
        Field[][] fields = board.getBoard();
        for (Ship ship: board.getShips()) {
            for (Coordinate coord: ship.getCoordinates()) {
                fields[coord.getX()][coord.getY()] = Field.SHIP;
            }
        }
        board.setValid(true);
    }

    public void positionShips(Board board, List<Ship> ships) {
        Field[][] fields = board.getBoard();
        for (Ship ship: ships) {
            for (Coordinate coord: ship.getCoordinates()) {
                fields[coord.getX()][coord.getY()] = Field.SHIP;
            }
        }
        board.setShips(ships);
    }

    private Coordinate getRandomCoordinate() {
        int x = ThreadLocalRandom.current().nextInt(0, 10);
        int y = ThreadLocalRandom.current().nextInt(0, 10);
        return new Coordinate(x, y);
    }

    private int getRandomDirection() {
        int rand = ThreadLocalRandom.current().nextInt(0, 2);
        return (rand == 0) ? Ship.DIRECTION_HORIZONTAL : Ship.DIRECTION_VERTICAL;
    }

    private void calcShipCoordinates(Ship ship, Coordinate start) {
        List<Coordinate> coordinates = new ArrayList<>();
        coordinates.add(start);
        if (ship.getDirection() == Ship.DIRECTION_HORIZONTAL) {
            for (int i = 1; i < ship.getLength(); i++) {
                coordinates.add(new Coordinate(start.getX() + i, start.getY()));
            }
        }
        else {
            for (int i = 1; i < ship.getLength(); i++) {
                coordinates.add(new Coordinate(start.getX(), start.getY() + i));
            }
        }
        ship.setCoordinates(coordinates);
    }

    public boolean validateShips(List<Ship> ships) {
        int[][] board = new int[10][10];
        for (Ship ship: ships) {
            for (Coordinate coord: ship.getCoordinates()) {
                for (int x = -1; x <= 1; x++) {
                    for (int y = -1; y <= 1; y++) {
                        int checkX = coord.getX() + x;
                        int checkY = coord.getY() + y;
                        if (checkX < 0 || checkX >= 10 || checkY < 0 || checkY >= 10) continue;
                        if (board[checkX][checkY] == 1) {
                            return false;
                        }
                    }
                }
            }
            for (Coordinate coord: ship.getCoordinates()) {
                board[coord.getX()][coord.getY()] = 1;
            }
        }
        return true;
    }

}
