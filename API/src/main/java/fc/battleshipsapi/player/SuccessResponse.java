package fc.battleshipsapi.player;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SuccessResponse {

    private boolean success;

    private String message;

    public SuccessResponse(boolean success) {
        this.success = success;
    }

}
