package fc.battleshipsapi.player;

import fc.battleshipsapi.game.IdRequest;
import fc.battleshipsapi.setup.SetupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
//@CrossOrigin(origins=WebSecurityConfig.ALLOWED_ORIGINS, allowCredentials = "true")
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private SetupService setupService;

    @GetMapping()
    public ResponseEntity<?> getPlayer() {
        Player player = playerService.getPlayerFromAuth();
        if (player == null) return ResponseEntity.status(404).body("Not found");
        return ResponseEntity.ok(player);
    }

    @GetMapping("/refresh")
    public ResponseEntity<?> refresh() {
        Player player = playerService.refreshPlayer();
        if (player == null) return ResponseEntity.status(404).body("Not found");
        return ResponseEntity.ok(player);
    }

    @GetMapping("/getall")
    public ResponseEntity<?> getPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @PostMapping("/match")
    public ResponseEntity<?> matchPlayer(@Valid @RequestBody MatchRequest request) {
        MatchRequest match = playerService.match(request);
        if (match == null) return ResponseEntity.badRequest().body("Unknown username");
        return ResponseEntity.ok(match);
    }

    @PostMapping("/acceptMatch")
    public ResponseEntity<?> acceptMatch(@Valid @RequestBody MatchRequest request) {
        String id = setupService.acceptMatch(request);
        if (id == null) return ResponseEntity.badRequest().body("Match does not exist");
        IdRequest response = new IdRequest();
        response.setId(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/declineMatch")
    public ResponseEntity<?> declineMatch(@Valid @RequestBody MatchRequest request) {
        boolean success = setupService.declineMatch(request);
        if (!success) return ResponseEntity.badRequest().body("Match does not exist");
        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/deleteMatch")
    public ResponseEntity<?> deleteMatch(@Valid @RequestBody MatchRequest request) {
        boolean success = setupService.deleteMatch(request);
        if (!success) return ResponseEntity.badRequest().body("Match does not exist");
        return ResponseEntity.ok(new SuccessResponse(true));
    }

}
