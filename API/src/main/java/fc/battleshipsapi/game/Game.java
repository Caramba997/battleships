package fc.battleshipsapi.game;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class Game {

    @Id
    private String id;

    private String player1;

    private String player2;

    private Board board1;

    private Board board2;

    private String turn;

    private State state;

    private String winner;

    private ZonedDateTime startedAt;

    private ZonedDateTime finishedAt;

    public Game(Game game) {
        this.id = game.getId();
        this.player1 = game.getPlayer1();
        this.player2 = game.getPlayer2();
        this.board1 = game.getBoard1();
        this.board2 = game.getBoard2();
        this.turn = game.getTurn();
        this.state = game.getState();
        this.winner = game.getWinner();
        this.startedAt = game.getStartedAt();
        this.finishedAt = game.getFinishedAt();
    }

}
