package fc.battleshipsapi.player;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.ZonedDateTime;

@Data
public class MatchRequest {

    @NotNull
    private String target;

    private String challenger;

    private ZonedDateTime createdAt;

}
