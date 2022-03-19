package fc.battleshipsapi.login;

import fc.battleshipsapi.player.Player;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class LoginResponse {

    private final String token;
    private final int tokenExpiration;
    private final Player player;
    
}
