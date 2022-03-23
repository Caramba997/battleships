package fc.battleshipsapi.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping
public class WebController {

    @GetMapping
    public ModelAndView home() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("index");
        return modelAndView;
    }

    @GetMapping("/web")
    public ModelAndView webHome() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("index");
        return modelAndView;
    }

    @GetMapping("/web/home")
    public ModelAndView index() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("home");
        return modelAndView;
    }

    @GetMapping("/web/login")
    public ModelAndView login() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("login");
        return modelAndView;
    }

    @GetMapping("/web/signup")
    public ModelAndView signup() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("signup");
        return modelAndView;
    }

    @GetMapping("/web/setup")
    public ModelAndView setup() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("setup");
        return modelAndView;
    }

    @GetMapping("/web/presetup")
    public ModelAndView presetup() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("presetup");
        return modelAndView;
    }

    @GetMapping("/web/game")
    public ModelAndView game() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("game");
        return modelAndView;
    }

    @GetMapping("/web/archive")
    public ModelAndView archive() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("archive");
        return modelAndView;
    }
}
