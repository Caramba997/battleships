package fc.battleshipsapi.login;

import fc.battleshipsapi.player.Player;
import fc.battleshipsapi.player.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class LoginService {

    @Autowired
    private JwtUtil jwtTokenUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlayerService playerService;

    public LoginResponse login(LoginRequest request) throws Exception {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        }
        catch (BadCredentialsException e) {
            throw new Exception("Incorrect username or password", e);
        }

        final UserDetails userDetails = playerService.loadUserByUsername(request.getUsername());

        Player player = playerService.getPlayerByUsername(request.getUsername());

        final String jwt = jwtTokenUtil.generateToken(userDetails);
        return new LoginResponse(jwt, jwtTokenUtil.TOKEN_EXPIRATION, player);
    }

    public Player registerPlayer(LoginRequest request) {
        if (playerService.getPlayerByUsername(request.getUsername()) != null) return null;
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Player player = playerService.save(new Player(request.getUsername(), encodedPassword));
        return player;
    }

}
