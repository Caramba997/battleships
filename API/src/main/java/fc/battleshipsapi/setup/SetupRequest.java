package fc.battleshipsapi.setup;

import fc.battleshipsapi.game.IdRequest;
import fc.battleshipsapi.game.Ship;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class SetupRequest extends IdRequest {

    @NotNull
    private List<Ship> ships;
}
