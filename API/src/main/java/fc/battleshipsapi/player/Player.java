package fc.battleshipsapi.player;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fc.battleshipsapi.game.Game;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@Document(collection = "players")
@JsonIgnoreProperties(value = { "password", "id", "enabled", "authorities", "credentialsNonExpired", "accountNonExpired", "accountNonLocked" }, allowSetters = true)
public class Player implements UserDetails {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String username;

    private String password;

    private List<MatchRequest> sentRequests;

    private List<MatchRequest> openRequests;

    private List<Game> activeGames;

    private List<Game> archiveGames;

    private ZonedDateTime createdAt;

    public Player(String username, String password) {
        this.username = username;
        this.password = password;
        this.sentRequests = Collections.emptyList();
        this.openRequests = Collections.emptyList();
        this.activeGames = Collections.emptyList();
        this.archiveGames = Collections.emptyList();
        this.createdAt = ZonedDateTime.now(ZoneId.of("Europe/Paris"));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
