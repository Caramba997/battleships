package fc.battleshipsapi;

import fc.battleshipsapi.login.LoginRequest;
import fc.battleshipsapi.login.LoginResponse;
import fc.battleshipsapi.login.LoginService;
import fc.battleshipsapi.player.Player;
import fc.battleshipsapi.player.PlayerRepository;
import fc.battleshipsapi.player.PlayerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Optional;

@SpringBootApplication
@Slf4j
public class BattleshipsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BattleshipsApiApplication.class, args);
    }

    @Bean
    CommandLineRunner createUsers(PlayerRepository repository, LoginService service) {
        return args -> {
            if (repository.findById("computer").isEmpty()) {
                Player ki = new Player("KI-Gegner", "Forbidden");
                ki.setId("computer");
                repository.insert(ki);

                log.info("[boot] Created computer player");
            }
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**");
            }
        };
    }

}
