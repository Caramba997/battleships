package fc.battleshipsapi.login;

import fc.battleshipsapi.player.Player;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@Slf4j
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody LoginRequest request) {
        Player player = loginService.registerPlayer(request);
        if (player != null) {
            log.info("[SIGNUP] Created player with username " + player.getUsername());
            return ResponseEntity.ok(player);
        }
        return ResponseEntity.badRequest().body("Could not create player");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = loginService.login(request);
            log.info("[LOGIN] Player with username " + request.getUsername() + " logged in");
            return ResponseEntity.ok(response);
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
