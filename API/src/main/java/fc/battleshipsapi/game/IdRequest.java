package fc.battleshipsapi.game;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class IdRequest {

    @NotNull
    private String id;

}
