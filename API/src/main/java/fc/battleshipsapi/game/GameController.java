package fc.battleshipsapi.game;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@Slf4j
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping("/getActive")
    public ResponseEntity<?> getGameWithId(@Valid @RequestBody IdRequest request) {
        Game game = gameService.getActive(request);
        if (game == null) return ResponseEntity.badRequest().body("No game found for given id");
        return ResponseEntity.ok(game);
    }

    @PostMapping("/getArchived")
    public ResponseEntity<?> getArchived(@Valid @RequestBody IdRequest request) {
        Game game = gameService.getArchived(request);
        if (game == null) return ResponseEntity.badRequest().body("No game found for given id");
        return ResponseEntity.ok(game);
    }

    @PostMapping("/shoot")
    public ResponseEntity<?> shoot(@Valid @RequestBody ShootRequest request) {
        Game game = gameService.shoot(request);
        if (game == null) return ResponseEntity.badRequest().body("Shoot was not possible");
        return ResponseEntity.ok(game);
    }

    @PostMapping("/surrender")
    public ResponseEntity<?> surrender(@Valid @RequestBody IdRequest request) {
        Game game = gameService.surrender(request);
        if (game == null) return ResponseEntity.badRequest().body("Surrender was not possible");
        return ResponseEntity.ok(game);
    }

}
