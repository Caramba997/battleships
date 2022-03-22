package fc.battleshipsapi;

import fc.battleshipsapi.ki.KIProperties;
import fc.battleshipsapi.login.LoginService;
import fc.battleshipsapi.mongo.ZonedDateTimeReadConverter;
import fc.battleshipsapi.mongo.ZonedDateTimeWriteConverter;
import fc.battleshipsapi.player.Player;
import fc.battleshipsapi.player.PlayerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@SpringBootApplication
@Slf4j
public class BattleshipsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BattleshipsApiApplication.class, args);
    }

    @Bean
    CommandLineRunner createUsers(PlayerRepository repository, LoginService service) {
        return args -> {
            if (repository.findById(KIProperties.ID).isEmpty()) {
                Player ki = new Player(KIProperties.USERNAME, "Forbidden");
                ki.setId(KIProperties.ID);
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

    @Configuration
    public class Converters {

        @Bean
        public MongoCustomConversions mongoCustomConversions() {
            return new MongoCustomConversions(
                    Arrays.asList(
                            new ZonedDateTimeReadConverter(),
                            new ZonedDateTimeWriteConverter()));
        }
    }

}
