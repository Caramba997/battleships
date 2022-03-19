package fc.battleshipsapi.game;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class Ship {

    public static int TYPE_2 = 2;
    public static int TYPE_3 = 3;
    public static int TYPE_4 = 4;
    public static int TYPE_5 = 5;
    public static int DIRECTION_HORIZONTAL = 0;
    public static int DIRECTION_VERTICAL = 1;

    private String name;

    private int length;

    private int direction;

    private List<Coordinate> coordinates;

    private boolean sunk;

    public Ship(String name, int type) throws IllegalArgumentException {
        this.name = name;
        this.direction = DIRECTION_HORIZONTAL;
        if (type != TYPE_2 && type != TYPE_3 && type != TYPE_4 && type != TYPE_5) throw new IllegalArgumentException("Unknown type");
        this.length = type;
        this.sunk = false;
    }

}
