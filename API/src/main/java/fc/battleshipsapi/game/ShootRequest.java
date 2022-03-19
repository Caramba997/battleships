package fc.battleshipsapi.game;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class ShootRequest extends IdRequest{

    @NotNull
    private Coordinate coordinate;

}
