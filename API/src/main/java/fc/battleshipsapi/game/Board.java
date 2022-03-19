package fc.battleshipsapi.game;

import lombok.Data;

import java.util.List;

@Data
public class Board {

    private Field[][] board;

    private List<Ship> ships;

    private boolean valid;

}
