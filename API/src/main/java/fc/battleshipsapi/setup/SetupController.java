package fc.battleshipsapi.setup;

import fc.battleshipsapi.game.Board;
import fc.battleshipsapi.game.BoardService;
import fc.battleshipsapi.game.Game;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/setup")
public class SetupController {

    @Autowired
    private SetupService setupService;

    @Autowired
    private BoardService boardService;

    @GetMapping("/singleplayer")
    public ResponseEntity<?> singleplayer() {
        Game game = setupService.createSingleplayerGame();
        if (game == null) return ResponseEntity.internalServerError().body("Something went wrong");
        return ResponseEntity.ok(game);
    }

    @GetMapping("/random")
    public ResponseEntity<?> getRandomBoard() {
        Board board = boardService.createRandomBoard();
        return ResponseEntity.ok(board);
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(@RequestBody SetupRequest request) {
        Game game = setupService.placeShips(request);
        if (game == null) return ResponseEntity.badRequest().body("Ship placement invalid");
        return ResponseEntity.ok(game);
    }

}
