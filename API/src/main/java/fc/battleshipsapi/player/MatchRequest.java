package fc.battleshipsapi.player;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class MatchRequest {

    @NotNull
    private String target;

    private String challenger;

    private LocalDateTime createdAt;

}
