package fc.battleshipsapi.player;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends MongoRepository<Player, String> {

    Optional<Player> findPlayerByUsername(String email);

    @Query(value="{}", fields="{ username: 1, _id: 0 }")
    List<Player> findAllUsernames();

}
