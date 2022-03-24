package fc.battleshipsapi.player;

import fc.battleshipsapi.game.Game;
import fc.battleshipsapi.game.State;
import fc.battleshipsapi.ki.KIProperties;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@AllArgsConstructor
@Slf4j
public class PlayerService implements UserDetailsService {

    private final PlayerRepository playerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserDetails player = getPlayerByUsername(username);
        if (player != null) return player;
        throw new UsernameNotFoundException(username);
    }

    public Player getPlayerByUsername(String username) {
        Optional<Player> optional = playerRepository.findPlayerByUsername(username);
        if (optional.isPresent()) return optional.get();
        return null;
    }

    public Player getPlayerById(String id) {
        Optional<Player> optional = playerRepository.findById(id);
        if (optional.isPresent()) return optional.get();
        return null;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player save(Player player) {
        try {
            playerRepository.save(player);
            return player;
        }
        catch (Exception e) {
            return null;
        }
    }

    public String getUsernameFromAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof AnonymousAuthenticationToken)) {
            return authentication.getName();
        }
        return null;
    }

    public Player getPlayerFromAuth() {
        String username = getUsernameFromAuth();
        if (username == null) return null;
        Player player = getPlayerByUsername(username);
        return player;
    }

    public Player refreshPlayer() {
        Player player = getPlayerFromAuth();
        if (player == null) return null;
        List<Game> finishedGames = new ArrayList<>();
        for (Game game: player.getActiveGames()) {
            if (game.getState().equals(State.FINISHED) || game.getState().equals(State.CANCELLED)) {
                finishedGames.add(game);
            }
        }
        for (Game finishedGame: finishedGames) {
            player.getActiveGames().remove(finishedGame);
        }
        save(player);
        return player;
    }

    public MatchRequest match(MatchRequest request) {
        Player player = getPlayerFromAuth();
        if (player == null) return null;
        if (player.getUsername().equals(request.getTarget())) return null;
        for (MatchRequest sentRequests: player.getSentRequests()) {
            if (sentRequests.getTarget().equals(request.getTarget())) return null;
        }
        for (MatchRequest openRequests: player.getOpenRequests()) {
            if (openRequests.getChallenger().equals(request.getTarget())) return null;
        }
        for (Game game: player.getActiveGames()) {
            if (game.getPlayer2().equals(request.getTarget())) return null;
        }
        Player enemy = getPlayerByUsername(request.getTarget());
        if (enemy == null) return null;
        request.setChallenger(player.getUsername());
        request.setCreatedAt(ZonedDateTime.now(ZoneId.of("Europe/Paris")));
        player.getSentRequests().add(request);
        playerRepository.save(player);
        enemy.getOpenRequests().add(request);
        playerRepository.save(enemy);
        return request;
    }

    public MatchRequest randomMatch() {
        Player player = getPlayerFromAuth();
        if (player == null) return null;
        List<Player> allPlayers = playerRepository.findAllUsernames();
        List<String> allUsernames = new ArrayList<>();
        for (Player fromAll: allPlayers) {
            if (fromAll.getUsername().equals(KIProperties.USERNAME) || player.getUsername().equals(fromAll.getUsername()) || fromAll.getUsername().equals("Entwickler")) continue;
            allUsernames.add(fromAll.getUsername());
        }
        for (MatchRequest sentRequest: player.getSentRequests()) {
            if (allUsernames.contains(sentRequest.getTarget())) {
                allUsernames.remove(sentRequest.getTarget());
                continue;
            }
        }
        for (MatchRequest openRequest: player.getOpenRequests()) {
            if (allUsernames.contains(openRequest.getChallenger())) {
                allUsernames.remove(openRequest.getChallenger());
                continue;
            }
        }
        for (Game activeGame: player.getActiveGames()) {
            if (allUsernames.contains(activeGame.getPlayer2())) {
                allUsernames.remove(activeGame.getPlayer2());
                continue;
            }
        }
        if (allUsernames.isEmpty()) return null;
        int random = new Random().nextInt(allUsernames.size());
        Player enemy = getPlayerByUsername(allUsernames.get(random));
        if (enemy == null) return null;
        MatchRequest request = new MatchRequest();
        request.setChallenger(player.getUsername());
        request.setTarget(enemy.getUsername());
        request.setCreatedAt(ZonedDateTime.now(ZoneId.of("Europe/Paris")));
        player.getSentRequests().add(request);
        playerRepository.save(player);
        enemy.getOpenRequests().add(request);
        playerRepository.save(enemy);
        return request;
    }

}
