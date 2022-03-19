package fc.battleshipsapi.debug;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Printer {

    public static void printBoard(int[][] b) {
        for (int x = 0; x < 10; x++) {
            log.info(""+b[x][0]+"|"+b[x][1]+"|"+b[x][2]+"|"+b[x][3]+"|"+b[x][4]+"|"+b[x][5]+"|"+b[x][6]+"|"+b[x][7]+"|"+b[x][8]+"|"+b[x][9]);
        }
    }

}
