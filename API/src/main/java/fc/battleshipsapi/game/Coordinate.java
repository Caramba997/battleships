package fc.battleshipsapi.game;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Coordinate {

    @NotNull
    private int x;

    @NotNull
    private int y;

}
