const speed = 1.2;

// socket.emit("clearLeaderboard");

const createPlatform = (group, spriteWidth, sceneHeight, myTexture, depth = 0, dist = 0) => {
  const platform = group
    .create(spriteWidth + dist, sceneHeight, myTexture)
    .setOrigin(0, 1)
    .setScale(0.5);
  group.setDepth(depth);
  if (myTexture === "ground") {
    platform.setImmovable(true);
    platform.setSize(platform.displayWidth * 2, platform.displayHeight * 2);
  }

  switch (myTexture) {
    case "ground":
      platform.setDepth(2);
      break;
    case "cloudss":
      platform.setDepth(1);
      break;
    default:
  }
};

const updatePlatform = (group, spriteWidth, sceneHeight, myTexture, dist = 0) => {
  const child = group.get(spriteWidth - dist, sceneHeight, myTexture);
  child.setVisible(true);
  child.setActive(true);
  switch (myTexture) {
    case "ground":
      child.setDepth(3);
      break;
    case "clouds":
      child.setDepth(1);
      break;
    default:
  }
};

const moveBackgroundPlatform = (group, platformWidth, sceneHeight, myTexture, scrollFactor) => {
  group.children.iterate((child) => {
    child.x -= scrollFactor;
    if (child.x < -child.displayWidth) {
      group.killAndHide(child);
      updatePlatform(group, platformWidth, sceneHeight, myTexture, scrollFactor);
    }
  });
};

class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
    });

    this.configure();
  }
  configure() {
    this.screen = "home";

    this.instructionGiven = false;

    this.score = localStorage.getItem("cholitos-bird-game-score");

    if (this.score === null) {
      this.score = 0;
    }

    this.highScore = localStorage.getItem("cholitos-bird-game-highScore");

    if (this.highScore === null) {
      this.highScore = 0;
    }

    this.remember = localStorage.getItem("cholitos-bird-game-remember");

    if (this.remember === null) {
      this.remember = false;

      this.username = null;

      this.email = null;

      this.news = null;
    } else if (this.remember) {
      this.username = localStorage.getItem("cholitos-bird-game-username");

      this.email = localStorage.getItem("cholitos-bird-game-email");

      this.news = localStorage.getItem("cholitos-bird-game-news");
    }

    this.codes = [];

    this.unlocked = null;

    this.soundOn = true;

    this.socket = new io();

    this.socket.on("userData", (data) => {
      if (data.codes) {
        try {
          const codes = JSON.parse(data.codes);
          if (Array.isArray(codes)) {
            this.codes = codes.sort((a, b) => a.points - b.points);
          }
        } catch (err) {
          console.log(err);
        }
      }
    });

    if (this.username) {
      this.socket.emit("userData", { username: this.username });
    }

    this.socket.on("usernameTaken", () => {
      this.notify(3);
    });

    this.socket.on("newUser", (data) => {
      if (data.remember) {
        this.username = data.username;

        this.email = data.email;

        localStorage.setItem("cholitos-bird-game-username", this.username);

        localStorage.setItem("cholitos-bird-game-email", this.email);

        localStorage.setItem("cholitos-bird-game-news", this.news);

        localStorage.setItem("cholitos-bird-game-remember", this.remember);
      }

      this.screen = "leaderboard";

      this.scene.restart();
    });

    this.socket.on("leaderboard", (data) => {
      this.loader.style.display = "none";

      this.addLeaderboardUI(data);
    });
  }

  preload() {
    this.load.setBaseURL("assets");
    this.load.plugin("rexroundrectangleplugin", "plugins/rexroundrectangleplugin.min.js", true);
    this.load.image("UIBackground", "backgrounds/UIBackground.png");
    this.load.image("background", "backgrounds/background.png");
    this.load.image("logo", "UI/background-logo.png");
    this.load.image("play", "UI/play-button.png");
    this.load.image("heart", "player/heart.png");
    this.load.image("heart-filled", "player/heart-filled.png");
    this.load.image("emitte", "player/emitte.png");
    this.load.image("star", "collectibles/star.png");
    this.load.image("home", "UI/home-icon.png");
    this.load.image("info", "UI/info.png");
    this.load.image("close", "UI/close.png");
    this.load.image("infoIcon", "UI/info-icon.png");
    this.load.image("userIcon", "UI/user-icon.png");
    this.load.image("soundOn", "UI/soundon-button.png");
    this.load.image("soundOff", "UI/soundoff-button.png");
    this.load.image("unlockedIcon", "UI/unlocked-icon.png");
    this.load.image("leaderboardIcon", "UI/leaderboard-icon.png");
    this.load.image("leaderboardGold", "UI/gold.png");
    this.load.image("leaderboardSilver", "UI/silver.png");
    this.load.image("leaderboardBronze", "UI/bronze.png");
    this.load.image("copyIcon", "UI/copy.png");
    this.load.image("b1", "player/bird-1.png");
    this.load.image("b2", "player/bird-2.png");

    for (let i = 1; i <= 3; ++i) {
      this.load.image(`product${i}`, `products/product${i + 1}.png`);
    }

    for (let i = 1; i <= 3; ++i) {
      this.load.image(`cloud${i}`, `clouds/cloud${i}.png`);
    }

    this.load.audio("jump", "sounds/jumpSound.mp3");

    this.load.audio("product", "sounds/product.mp3");

    this.load.audio("enemy", "sounds/enemy.mp3");

    this.load.audio("lost", "sounds/lost.mp3");

    this.load.audio("music", "sounds/theme1.mp3");

    this.load.audio("woosh", "sounds/Woosh.mp3");

    this.load.image("welcomebg", "startbg.jpeg");
    this.load.image("welcomebgcholitos", "welcomecholitos.png");
    this.load.image("progress", "progress.png");
    this.load.image("progress2", "progress2.png");
    this.load.image("playbtn", "playBtn.png");
    this.load.image("soundOn", "soundOn.png");
    this.load.image("soundOff", "soundOff.png");
    this.load.image("detailsBox", "descriptionBox.png");
    this.load.audio("startSound", "startSound.mp3");
    this.load.image("endbg", "endbg.jpeg");

    this.load.image("sky", "endless_runner/parallax2/layer_04.png");
    this.load.image("clouds", "endless_runner/parallax2/layer_05.png");
    this.load.image("mountains", "endless_runner/parallax2/layer_03.png");
    this.load.image("trees", "endless_runner/parallax2/layer_02.png");
    this.load.image("ground", "endless_runner/parallax2/layer_01.png");
    this.load.image("coin", "endless_runner/coin.png");
    this.load.image("missile", "endless_runner/missile.png");
    this.load.image("missile2", "endless_runner/missile2.png");

    this.load.audio("pickcoin", "sounds/pickCoin.wav");
    this.load.audio("explosion", "sounds/explode.wav");
    this.load.audio("killmissile", "sounds/killMissile.mp3");

    this.load.spritesheet("player", "endless_runner/player.png", {
      frameWidth: 135,
      frameHeight: 179,
    });
    this.load.spritesheet("bird", "endless_runner/birdSprite.png", {
      frameWidth: 860 / 3,
      frameHeight: 792 / 3,
    });
    this.load.spritesheet("explosion", "endless_runner/explosion.png", {
      frameWidth: 64,
      frameHeight: 63,
    });
  }

  create() {
    this.checkSocket();
    this.canJump = true;
  }
  checkSocket() {
    this.loader = document.querySelector("#loader");

    this.socketInterval = setInterval(() => {
      if (this.socket.connected) {
        clearInterval(this.socketInterval);

        loader.style.display = "none";

        this.addUI();
      }
    }, 50);
  }

  addUI() {
    if (this.screen === "home") {
      this.addHomeUI();
      // this.startGame();
    } else if (this.screen === "restart") {
      this.addRestartUI();
    } else if (this.screen === "replay") {
      this.addReplayUI();
    } else if (this.screen === "info") {
      this.addInfoUI();
    } else if (this.screen === "codes") {
      this.addCodesUI();
    } else if (this.screen === "unlocked") {
      this.addUnlockedUI();
    } else if (this.screen === "leaderboard") {
      this.loader.style.display = "block";
      this.socket.emit("leaderboard");
    }
  }
  addHomeUI() {
    this.UIBackground = this.add.image(400, 600, "UIBackground").setScale(1);

    this.infoIcon = this.add.image(740, 55, "infoIcon").setScale(0.4).setInteractive();

    this.infoIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.infoIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.infoIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "info";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.optionsContainer = this.add.rexRoundRectangle(400, 900, 570, 450, 50, 0x66a666).setDepth(5).setScrollFactor(0);

    this.termsText = this.add
      .text(400, 1170, "Powered by Md Mahabub. By playing this game you accept these Terms & policies.", {
        fontFamily: "RakeslyRG",
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.option1 = this.add.rexRoundRectangle(400, 830, 470, 80, 50, 0xf3e3a3).setDepth(5).setScrollFactor(0).setInteractive();

    this.option1Text = this.add
      .text(400, 830, "Unlocked Offers", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);
    // color: "#2e218e",

    this.option2 = this.add.rexRoundRectangle(400, 945, 470, 80, 50, 0xfaa7ab).setDepth(5).setScrollFactor(0).setInteractive();

    this.option2Text = this.add
      .text(400, 945, "Leaderboard", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option3 = this.add.rexRoundRectangle(400, 1060, 470, 80, 50, 0x4e316e).setDepth(5).setScrollFactor(0).setInteractive();

    this.option3Text = this.add
      .text(400, 1060, "Play Game", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.bestScoreText = this.add
      .text(320, 730, `BEST: ${this.highScore}`, {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        stroke: "#000",
        strokeThickness: 1,
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.lastScoreText = this.add
      .text(480, 730, `LAST: ${this.score}`, {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        stroke: "#000",
        strokeThickness: 1,
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.divider = this.add.rectangle(400, 730, 5, 70, 0xeeeeee).setDepth(6).setScrollFactor(0);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.screen = "codes";
              this.scene.restart();
            },
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.screen = "leaderboard";
              this.scene.restart();
            },
          });
        },
      });
    });

    this.option3.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option3, this.option3Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option3, this.option3Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.UIBackground,
                this.optionsContainer,
                this.termsText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.option3,
                this.option3Text,
                this.bestScoreText,
                this.lastScoreText,
                this.divider,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });
  }
  addRestartUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add.image(740, 55, "home").setScale(0.4).setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.3,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreBox = this.add.rexRoundRectangle(400, 200, 300, 70, 20, 0x4e316e).setDepth(Infinity).setScrollFactor(0);

    this.scoreImage = this.add.image(265, 200, "star").setDepth(Infinity).setScrollFactor(0).setScale(0.9);

    this.scoreText = this.add
      .text(400, 200, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.ballImage = this.add.image(400, 100, "logo").setScale(0.7).setDepth(Infinity);

    this.titleText = this.add
      .text(400, 330, "Do you want to submit your score? And be\nable to win some nice prizes? The username\nwill be shown on the leaderboard.", {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5);

    this.usernameInput = this.add.dom(400, 470).createElement(
      "input",
      `
      	outline: none;
      	border: none;
      	padding: 0px 30px;
      	width: 450px;
      	height: 90px;
      	font-size: 30px;
      	font-weight: bold;
      	background: #ebf4f5;
      	border-radius: 20px;
      `
    );

    this.usernameInput.node.setAttribute("placeholder", "Username");

    this.usernameInput.node.setAttribute("maxLength", "15");

    this.emailInput = this.add.dom(400, 580).createElement(
      "input",
      `
      	outline: none;
      	border: none;
      	padding: 0px 30px;
      	width: 450px;
      	height: 90px;
      	font-size: 30px;
      	font-weight: bold;
      	background: #ebf4f5;
      	border-radius: 20px;
      `
    );

    this.emailInput.node.setAttribute("placeholder", "Email");

    this.emailInput.node.setAttribute("type", "email");

    this.agreeCheckBox = this.add
      .dom(145, 650)
      .createElement(
        "div",
        `
      	width: 70px;
      	height: 70px;
      	background: #ebf4f5;
      	border-radius: 20px;
      	cursor: pointer;
      `
      )
      .setInteractive()
      .setOrigin(0);

    this.agreeCheckBoxMark = this.add
      .dom(165, 670)
      .createElement(
        "div",
        `
      	width: 30px;
      	height: 30px;
      	background: #000;
      	border-radius: 10px;
      	cursor: pointer;
      `
      )
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0);

    this.agreeText = this.add
      .text(235, 663, "Agree to terms & conditions?", {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        color: "#511a73",
        align: "center",
      })
      .setInteractive({ cursor: "pointer" });
    this.agreeText.on("pointerup", () => {
      const url = "https://proviva.se";
      window.open(url, "_blank");
    });

    this.signCheckBox = this.add
      .dom(145, 735)
      .createElement(
        "div",
        `
      	width: 70px;
      	height: 70px;
      	background: #ebf4f5;
      	border-radius: 20px;
      	cursor: pointer;
      `
      )
      .setInteractive()
      .setOrigin(0);

    this.signCheckBoxMark = this.add
      .dom(165, 755)
      .createElement(
        "div",
        `
      	width: 30px;
      	height: 30px;
      	background: #000;
      	border-radius: 10px;
      	cursor: pointer;
      `
      )
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0);

    this.signText = this.add.text(235, 748, "Sign up for newsletter", {
      fontFamily: "RakeslyRG",
      fontSize: "36px",
      color: "#511a73",
      align: "center",
    });

    this.rememberCheckBox = this.add
      .dom(145, 820)
      .createElement(
        "div",
        `
      	width: 70px;
      	height: 70px;
      	background: #ebf4f5;
      	border-radius: 20px;
      	cursor: pointer;
      `
      )
      .setInteractive()
      .setOrigin(0);

    this.rememberCheckBoxMark = this.add
      .dom(165, 840)
      .createElement(
        "div",
        `
      	width: 30px;
      	height: 30px;
      	background: #000;
      	border-radius: 10px;
      	cursor: pointer;
      `
      )
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0);

    this.agreeText = this.add.text(235, 833, "Remember me", {
      fontFamily: "RakeslyRG",
      fontSize: "36px",
      color: "#511a73",
      align: "center",
    });

    this.agreeCheckBox.on("pointerdown", () => {
      this.agreeCheckBoxMark.setVisible(!this.agreeCheckBoxMark.visible);

      if (this.agreeCheckBoxMark.visible) {
        this.option1.setAlpha(1);

        this.option1.setInteractive();
      } else {
        this.option1.setAlpha(0.4);

        this.option1.removeInteractive();
      }
    });

    this.signCheckBox.on("pointerdown", () => {
      this.news = !this.news;

      this.signCheckBoxMark.setVisible(!this.signCheckBoxMark.visible);
    });

    this.rememberCheckBox.on("pointerdown", () => {
      this.remember = !this.remember;

      this.rememberCheckBoxMark.setVisible(!this.rememberCheckBoxMark.visible);
    });

    this.option1 = this.add.rexRoundRectangle(400, 975, 520, 100, 50, 0x3e9e79).setDepth(5).setScrollFactor(0).setAlpha(0.4);

    this.option1Text = this.add
      .text(400, 975, "Submit result", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option2 = this.add.rexRoundRectangle(400, 1090, 520, 100, 50, 0x4e316e).setDepth(5).setScrollFactor(0).setInteractive();

    this.option2Text = this.add
      .text(400, 1090, "Nope, let's start over", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              if (this.validateUsername(this.usernameInput.node.value)) {
                if (this.validateEmail(this.emailInput.node.value)) {
                  this.socket.emit(
                    "scoreUpdate",
                    {
                      username: this.usernameInput.node.value,
                      email: this.emailInput.node.value,
                      score: this.score,
                      remember: this.remember,
                      news: this.news,
                      newUser: true,
                    },
                    (data) => {
                      if (this.remember) {
                        this.username = data.username;
                        this.email = data.email;
                        localStorage.setItem("cholitos-bird-game-username", this.username);
                        localStorage.setItem("cholitos-bird-game-email", this.email);
                        localStorage.setItem("cholitos-bird-game-news", this.news);
                        localStorage.setItem("cholitos-bird-game-remember", this.remember);
                      }

                      if (data.unlocked) {
                        this.unlocked = data.unlocked;
                        this.screen = "unlocked";
                        this.scene.restart();
                      } else {
                        this.screen = "replay";
                        this.scene.restart();
                      }
                    }
                  );
                } else {
                  this.notify(2);
                }
              } else {
                this.notify(1);
              }
            },
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.UIBackground,
                this.homeIcon,
                this.scoreBox,
                this.scoreImage,
                this.scoreText,
                this.ballImage,
                this.titleText,
                this.usernameInput,
                this.emailInput,
                this.agreeCheckBox,
                this.agreeCheckBoxMark,
                this.agreeText,
                this.signCheckBox,
                this.signCheckBoxMark,
                this.signText,
                this.rememberCheckBox,
                this.rememberCheckBoxMark,
                this.agreeText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.option2,
                this.termsText,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });

    this.termsText = this.add
      .text(400, 1170, "Powered by Cholitos. By playing this game you accept these Terms & policies.", {
        fontFamily: "RakeslyRG",
        fontSize: "20px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
  }
  addReplayUI() {
    this.background = this.add.image(400, 600, "background").setScale(1.4).setScrollFactor(0).setDepth(0);

    this.homeIcon = this.add.image(740, 55, "home").setScale(0.5).setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreTitle = this.add
      .text(400, 170, this.score > this.tempHighScore ? "New highscore" : "Your score", {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.scoreBox = this.add.rexRoundRectangle(400, 250, 300, 70, 20, 0x4e316e).setDepth(10).setScrollFactor(0);

    this.scoreImage = this.add.image(265, 250, "star").setDepth(Infinity).setScrollFactor(0).setScale(0.9);

    this.scoreText = this.add
      .text(400, 250, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.playButton = this.add.image(400, 600, "play").setScale(1.3).setInteractive();

    this.playTitle = this.add
      .text(400, 850, "Play again", {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.playButton.on("pointerdown", () => {
      this.tweens.add({
        targets: this.playButton,
        scale: 1.1,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.playButton,
            scale: 1.3,
            duration: 100,

            onComplete: () => {
              this.elements = [this.background, this.homeIcon, this.scoreTitle, this.scoreBox, this.scoreImage, this.scoreText, this.playButton, this.playTitle];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });
  }
  addLeaderboardUI(data) {
    this.background = this.add.image(400, 600, "background").setScale(1.4).setScrollFactor(0).setDepth(0);

    if (this.remember) {
      this.userIcon = this.add.image(650, 55, "userIcon").setScale(0.5).setInteractive().setScrollFactor(0).setDepth(Infinity);

      this.userIcon.on("pointerdown", () => {
        this.tweens.add({
          targets: this.userIcon,
          scale: 0.4,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: this.userIcon,
              scale: 0.5,
              duration: 100,

              onComplete: () => {
                this.userIcon.destroy();

                this.notify(4);

                this.username = null;

                this.email = null;

                this.remember = false;

                localStorage.removeItem("cholitos-bird-game-remember");

                localStorage.removeItem("cholitos-bird-game-username");

                localStorage.removeItem("cholitos-bird-game-email");
              },
            });
          },
        });
      });
    }

    this.homeIcon = this.add.image(740, 55, "home").setScale(0.4).setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.leaderboardImage = this.add.image(400, 170, "leaderboardIcon");

    this.leaderboardTitle = this.add
      .text(400, 310, "Leaderboard", {
        fontFamily: "RakeslyRG",
        fontSize: "45px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.scores = Object.entries(data)
      .map((score) => {
        return score[1];
      })
      .sort((a, b) => b.score - a.score);

    this.players = this.add.dom(400, 375, "div");

    this.players.node.style = `
      	margin: 0px 0px 0px -300px;
      	padding: 0px 20px 0px 0px;
      	width: 600px;
      	height: 770px;
      	display: flex;
      	flex-direction: column;
      	align-items: center;
      	justify-content: center;
      	overflow-y: auto;
      `;

    this.players.node.innerHTML = ``;

    this.scores.forEach((user, index) => {
      this.players.node.innerHTML += `
      		<div class="scoreBox">
      			<div class="scoreImageBox">
      				${index < 3 ? `<img class="scoreImage" src="assets/positions/${index + 1}.png"/>` : `<div class="scoreText"> ${index + 1}. </div>`}
      			</div>

      			<div class="${user.username === this.username ? "scoreTitlePlus" : "scoreTitle"}">
      				${user.username}
      			</div>

      			<div class="${user.username === this.username ? "scoreValuePlus" : "scoreValue"}">
      				${user.score}
      			</div>
      		</div>
      	`;
    });
  }
  addCodesUI() {
    this.background = this.add.image(400, 600, "background").setScale(1.4).setScrollFactor(0).setDepth(0);

    this.homeIcon = this.add.image(740, 55, "home").setScale(0.4).setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.unlockedImage = this.add.image(400, 170, "unlockedIcon");

    this.unlockedTitle = this.add
      .text(400, 310, "Unlocked codes", {
        fontFamily: "RakeslyRG",
        fontSize: "45px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.codes.forEach((code, index) => {
      const y = 450 + index * 110;

      const codeBox = this.add.rexRoundRectangle(400, y, 520, 100, 20, 0xffffff).setDepth(5).setScrollFactor(0);

      const scoreImage = this.add.image(192, y, "star").setDepth(Infinity).setScrollFactor(0).setScale(0.7);

      const scoreText = this.add
        .text(300, y, `${code.points} points`, {
          fontFamily: "RakeslyRG",
          fontSize: "32px",
          color: "#000",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(6);

      const codeText = this.add
        .text(515, y, code.code, {
          fontFamily: "RakeslyRG",
          fontSize: "32px",
          color: "#000",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(6);

      const codeCopy = this.add
        .image(610, y - 3, "copyIcon")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.1)
        .setInteractive();

      codeCopy.on("pointerdown", () => {
        this.tweens.add({
          targets: codeCopy,
          scale: 0.08,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: codeCopy,
              scale: 0.1,
              duration: 100,

              onComplete: () => {
                navigator.clipboard.writeText(code.code);

                this.notify(5);
              },
            });
          },
        });
      });
    });

    this.cholitosButton = this.add.rexRoundRectangle(400, 1060, 420, 100, 50, 0x4e316e).setDepth(5).setScrollFactor(0).setInteractive();

    this.cholitosButtonText = this.add
      .text(400, 1060, "Go to Cholitos", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.cholitosButton.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.cholitosButton, this.cholitosButtonText],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.cholitosButton, this.cholitosButtonText],
            scale: 1,
            duration: 100,

            onComplete: () => {},
          });
        },
      });
    });
  }
  addUnlockedUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add.image(740, 55, "home").setScale(0.5).setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreBox = this.add.rexRoundRectangle(400, 200, 300, 70, 20, 0x4e316e).setDepth(10).setScrollFactor(0);

    this.scoreImage = this.add.image(265, 200, "star").setDepth(Infinity).setScrollFactor(0).setScale(0.9);

    this.scoreText = this.add
      .text(400, 200, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.ballImage = this.add.image(400, 100, "logo").setScale(0.7).setDepth(Infinity);

    if (!this.unlocked) {
      this.scene.restart();
      return;
    }

    this.titleText = this.add
      .text(400, 340, `Congrats! You score over ${this.unlocked.points}\npoints and unlocked a special\ndeal in cholitos.`, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5);

    this.productImage = this.add.image(400, 595, "product1").setScale(1.1);

    this.productBox = this.add.rexRoundRectangle(400, 850, 520, 100, 20, 0xebf4f5).setDepth(Infinity).setScrollFactor(0);

    this.codeText = this.add
      .text(235, 850, this.unlocked.code, {
        fontFamily: "RakeslyRG",
        fontSize: "35px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(Infinity);

    this.codeCopy = this.add.image(485, 850, "copyIcon").setDepth(Infinity).setScrollFactor(0).setScale(0.1).setInteractive();

    this.copyCodeText = this.add
      .text(575, 850, "Copy Code", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#bababa",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(Infinity)
      .setInteractive();

    this.codeCopy.on("pointerdown", () => {
      this.tweens.add({
        targets: this.codeCopy,
        scale: 0.08,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.codeCopy,
            scale: 0.1,
            duration: 100,

            onComplete: () => {
              navigator.clipboard.writeText(this.unlocked.code);

              this.notify(6);
            },
          });
        },
      });
    });

    this.copyCodeText.on("pointerdown", () => {
      this.tweens.add({
        targets: this.codeCopy,
        scale: 0.08,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.codeCopy,
            scale: 0.1,
            duration: 100,

            onComplete: () => {
              navigator.clipboard.writeText(this.unlocked.code);

              this.notify(6);
            },
          });
        },
      });
    });

    this.option1 = this.add.rexRoundRectangle(400, 975, 520, 100, 50, 0x335519).setDepth(5).setScrollFactor(0).setInteractive();

    this.option1Text = this.add
      .text(400, 975, "Redeem code on Cholitos", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option2 = this.add.rexRoundRectangle(400, 1090, 520, 100, 50, 0x4e316e).setDepth(5).setScrollFactor(0).setInteractive();

    this.option2Text = this.add
      .text(400, 1090, "Play again", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {},
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              let elements = [
                this.UIackground,
                this.homeIcon,
                this.scoreBox,
                this.scoreImage,
                this.scoreText,
                this.ballImage,
                this.titleText,
                this.productImage,
                this.productBox,
                this.codeText,
                this.codeCopy,
                this.copyCodeText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.termsText,
              ];

              elements.forEach((element) => {
                if (element) {
                  element.destroy();
                }
              });

              this.startGame();
            },
          });
        },
      });
    });

    this.termsText = this.add
      .text(400, 1170, "Powered by Cholitos. By playing this game you accept these Terms & policies.", {
        fontFamily: "RakeslyRG",
        fontSize: "20px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
  }
  addInfoUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add.image(740, 55, "home").setScale(0.4).setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.infoImage = this.add.image(400, 170, "info").setScale();

    this.infoTitle = this.add
      .text(400, 310, "Information", {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.infoText = this.add
      .text(
        400,
        710,
        "Desktop Controls: Use left and right arrow keys\nto control the ball.\n\nMobile Controls: Touch left and right sides of the\nscreen to control the ball.\n\nSpring: Allows you to jump higher.\n\nJetpack: Gives you flying ability for a few seconds.\n\nProducts: Collect them to win extra points\nand rewards.\n\nMonsters: AVOID! You will lost the game if you\ncollide with them.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "35px",
          color: "#000",
          align: "center",
          stroke: "#000",
          strokeThickness: 0,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);
  }
  validateEmail(value) {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (value.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  }
  validateUsername(value) {
    // Define the regex pattern to disallow certain characters
    const pattern = /[ .$#[\]\/\x00-\x1F\x7F]/;
    // Test the input string against the pattern
    if (pattern.test(value)) {
      return false; // Invalid string (contains disallowed characters)
    }
    return true; // Valid string
  }

  startGame() {
    this.gameVeriables();
    this.createAnimations();
    this.addBackground();
    this.addGameUI();
    this.addSounds();
    this.addScores();
    this.addLife();

    if (!this.instructionGiven) {
      this.instructionBox = this.add.rexRoundRectangle(400, 600, 700, 600, 30, 0xffffff).setDepth(10).setScrollFactor(0).setOrigin(0.5);
      this.instructionText1 = this.add
        .text(300, 370, "How to play", {
          fontFamily: "RakeslyRG",
          fontSize: "50px",
          color: "#000",
          align: "center",
          stroke: "#000",
        })
        .setDepth(11);
      this.instructionText2 = this.add
        .text(150, 500, "Press space key or touch on the\nscreen to jump. You have to pass\nover the missiles. Land on the missile\ngive you extra time.", {
          fontFamily: "RakeslyRG",
          fontSize: "40px",
          color: "#000",
          align: "center",
          stroke: "#000",
        })
        .setDepth(11);

      this.closeIcon = this.add
        .image(680, 370, "close")

        .setDepth(11)
        .setInteractive();
      this.closeIcon.on("pointerdown", () => {
        this.tweens.add({
          targets: this.closeIcon,
          scale: 0.9,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: this.closeIcon,
              scale: 1,
              duration: 100,

              onComplete: () => {
                this.tweens.add({
                  targets: [this.closeIcon, this.instructionBox, this.instructionText1, this.instructionText2],
                  alpha: { from: 1, to: 0.3 },
                  duration: 200,
                  onComplete: () => {
                    this.instructionGiven = true;
                    this.closeIcon.destroy();
                    this.instructionBox.destroy();
                    this.instructionText1.destroy();
                    this.instructionText2.destroy();

                    this.start();
                  },
                });
              },
            });
          },
        });
      });
    }
    if (this.instructionGiven) {
      this.start();
    }
  }
  gameVeriables() {
    this.timer = 0;
    this.secondTimer = 0;
    this.healthTimer = 0;
    this.missileScore = 0;
    this.score = 0;
    this.score = 0;
    this.health = 120;
    this.jumpTimes = 2;
    this.jump = 0;
  }
  createAnimations() {
    this.createAnimation("run", "player", 0, 5, -1, 12);
    this.createAnimation("jump", "player", 0, 0, -1, 1);
    this.createAnimation("fly", "bird", 0, 8, -1, 7);
    this.createAnimation("explode", "explosion", 0, 15, 0, 20);
    this.createAnimation("idle", "explosion", 15, 15, -1, 1);
  }
  createAnimation(animKey, spriteKey, startFrame, endFrame, loopTimes, frameRate) {
    return this.anims.create({
      key: animKey,
      frames: this.anims.generateFrameNumbers(spriteKey, {
        start: startFrame,
        end: endFrame,
      }),
      frameRate,
      repeat: loopTimes,
    });
  }
  addBackground() {
    this.bg = this.add.image(400, 600, "sky");
    this.bg.displayHeight = this.scale.height;
    this.bg.scaleX = this.bg.scaleY;

    this.cloudsGroup = this.add.group();
    this.firstMountain = this.cloudsGroup
      .create(0, this.scale.height - 200, "clouds")
      .setScale(0.5)
      .setOrigin(0, 1);
    this.cloudsWidth = this.firstMountain.displayWidth;
    this.cloudsGroup.setDepth(1);
    createPlatform(this.cloudsGroup, this.cloudsWidth, this.scale.height - 200, "clouds", 1);

    this.mountainsGroup = this.add.group();
    this.firstPlateau = this.mountainsGroup.create(0, this.scale.height, "mountains").setScale(0.5).setOrigin(0, 1);
    this.mountainsWidth = this.firstPlateau.displayWidth;
    this.mountainsGroup.setDepth(2);
    createPlatform(this.mountainsGroup, this.mountainsWidth, this.scale.height, "mountains", 2);

    this.treesGroup = this.add.group();
    this.firstTree = this.treesGroup.create(0, this.scale.height, "trees").setScale(0.5).setOrigin(0, 1);
    this.treesWidth = this.firstTree.displayWidth;
    this.treesGroup.setDepth(3);
    createPlatform(this.treesGroup, this.treesWidth, this.scale.height, "trees", 5);

    this.groundGroup = this.physics.add.group();
    this.first = this.groundGroup.create(0, this.scale.height, "ground").setOrigin(0, 1).setScale(0.5);
    this.first.setImmovable(true);
    this.groundWidth = this.first.displayWidth;
    this.groundHeight = this.first.displayHeight;
    this.first.setSize(this.groundWidth * 2, this.groundHeight * 2);
    this.groundGroup.setDepth(4);
    createPlatform(this.groundGroup, this.groundWidth, this.scale.height, "ground", 4);
  }
  addGameUI() {
    this.homeIcon = this.add.image(660, 55, "home").setScale(0.4).setInteractive().setScrollFactor(0).setDepth(Infinity);

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.3,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.playing = false;

              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.soundIcon = this.add
      .image(740, 55, this.soundOn ? "soundOn" : "soundOff")
      .setScale(0.4)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.soundIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.soundIcon,
        scale: 0.3,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.soundIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              if (this.soundOn) {
                this.sound.stopAll();

                this.soundOn = false;

                this.soundIcon.setTexture("soundOff");
              } else {
                this.soundOn = true;

                this.soundIcon.setTexture("soundOn");
              }
            },
          });
        },
      });
    });
  }
  addSounds() {
    this.jumpSound = this.sound.add("jump");

    this.productSound = this.sound.add("product");

    this.lostSound = this.sound.add("lost");

    this.musicSound = this.sound.add("music");

    this.hoopSound = this.sound.add("woosh");

    this.coinSound = this.sound.add("pickcoin");

    this.explosionSound = this.sound.add("explosion");

    this.killmissileSound = this.sound.add("killmissile");
  }
  addScores() {
    this.score = 0;

    this.scoreHeading = this.add
      .text(30, 80, "Score :", {
        fontSize: "35px",
        fill: "#ffffff",
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 2,
        stroke: "#ff9900",
      })
      .setScrollFactor(0)
      .setDepth(8);
    this.scoreText = this.add
      .text(140, 80, `${this.score}`, {
        fontSize: "30px",
        fill: "#ffffff",
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 5,
        stroke: "#000",
      })
      .setScrollFactor(0)
      .setDepth(8);
  }
  addLife() {
    this.healthText = this.add
      .text(30, 30, "Health: ", {
        fontSize: "35px",
        fill: "#ffffff",
        strokeThickness: 4,
        fontFamily: '"Akaya Telivigala"',
        stroke: "#FF69B4",
      })
      .setScrollFactor(0)
      .setDepth(8);

    this.progressBox = this.add.graphics();
    this.progressBar = this.add.graphics();
    this.progressBox.setScrollFactor(0);
    this.progressBar.setScrollFactor(0);
    this.progressBox.setDepth(8);
    this.progressBar.setDepth(8);

    this.progressBox.lineStyle(4, 0x0275d8, 1);
    this.progressBox.strokeRect(143, 42, (this.health + 4) * 1.5, 20);

    this.progressBar.fillStyle(0x2bdee4, 1);
    this.progressBar.fillRect(145, 43, this.health * 1.5, 18);
  }

  start() {
    this.playing = true;

    if (this.soundOn) {
      this.musicSound.play({ loop: true });
    }
    this.createPlayer();
    this.createBirds();
    this.createMissiles();
    this.createControls();
    this.createTouchControls();
    this.collides();
  }
  createPlayer() {
    this.player = this.physics.add.sprite(150, this.scale.height - 500, "player").setScale(0.45);

    this.physics.add.collider(this.player, this.groundGroup);
    this.player.setGravityY(800);
    this.player.setDepth(6);
    this.player.body.setCollideWorldBounds();
    this.player.setSize(this.player.width / 2, this.player.height - 30);
    this.player.setOffset(this.player.width / 2 - 20, 30);
    this.player.speed = 100;

    this.player.moveDirection = {
      right: false,
    };

    this.player.flying = false;

    this.player.lost = false;

    this.player.ended = false;

    this.player.body.setGravityY(800);

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, 800, 1200, true);

    this.leftWall = this.physics.add.image(0, 600, null).setSize(1, 1200).setVisible(false).setVelocityX(this.player.speed);
    this.player.anims.play("run");
  }
  createBirds() {
    this.birdGroup = this.physics.add.group();

    const createBird = () => {
      const myY = Phaser.Math.Between(200, 500);
      const bird = this.birdGroup.create(this.scale.width + 100, myY, "bird").setScale(0.3);
      bird.setVelocityX(-100);
      bird.flipX = true;
      bird.setDepth(6);
      bird.anims.play("fly");
      bird.setSize(bird.displayWidth - 10, bird.displayHeight - 10);
    };
    this.birdCreationTime = this.time.addEvent({
      callback: createBird,
      delay: Phaser.Math.Between(2500, 5000),
      callbackScope: this,
      loop: true,
    });
    this.coinGroup = this.physics.add.group();
    const createCoin = () => {
      this.createBirdDrop(this.coinGroup, "coin");
    };
    this.coinCreationTime = this.time.addEvent({
      callback: createCoin,
      delay: 500,
      callbackScope: this,
      loop: true,
    });
  }
  createBirdDrop(group, texture) {
    if (this.birdGroup.getLength() >= 2) {
      const child = this.birdGroup.getChildren()[Phaser.Math.Between(0, this.birdGroup.getLength() - 1)];
      const drop = group.create(child.x, child.y, texture).setScale(0.05);
      drop.setGravityY(700);
      drop.setGravityX(0);
      drop.setDepth(6);
      drop.setBounce(0.9);
      drop.setSize(drop.width - 200, drop.height - 200);
    }
  }
  createMissiles() {
    this.missileGroup = this.physics.add.group();

    this.explosion = this.add.sprite(-100, -100, "explosion").setScale(0.5).setDepth(8);
    this.explosion.play("idle", true);
    this.leftBound = this.add.rectangle(-50, 0, 10, this.scale.height, 0x000000).setOrigin(0);
    this.boundGroup = this.physics.add.staticGroup();
    this.boundGroup.add(this.leftBound);

    const reduceHealthTimely = () => {
      if (this.health < 0) {
        this.health = 0;
      }
      this.progressBar.clear();
      this.progressBar.fillStyle(0x2bdee4, 1);
      this.progressBar.fillRect(145, 43, this.health * 1.5, 18);
      this.healthTimer = 0;
    };

    this.time.addEvent({
      callback: reduceHealthTimely,
      delay: 500,
      loop: true,
      callbackScope: this,
    });
  }

  createControls() {
    this.player.moveDirection.right = true;
  }
  createTouchControls() {
    this.touchLeft = this.add.rectangle(200, 600, 400, 1200, 0xffffff).setDepth(5).setScrollFactor(0).setAlpha(0.001).setInteractive();

    this.touchRight = this.add.rectangle(600, 600, 400, 1200, 0xffffff).setDepth(5).setScrollFactor(0).setAlpha(0.001).setInteractive();

    this.touchLeft.on("pointerdown", () => {
      if (this.player.body.touching.down || (this.jump < this.jumpTimes && this.jump > 0)) {
        this.player.setVelocityY(-400);
        if (this.soundOn) {
          this.jumpSound.play();
        }
        if (this.player.body.touching.down) {
          this.jump = 0;
        }
        this.jump += 1;
      }
    });

    this.touchRight.on("pointerdown", () => {
      if (this.player.body.touching.down || (this.jump < this.jumpTimes && this.jump > 0)) {
        this.player.setVelocityY(-400);
        if (this.soundOn) {
          this.jumpSound.play();
        }
        if (this.player.body.touching.down) {
          this.jump = 0;
        }
        this.jump += 1;
      }
      if (this.soundOn) {
        this.jumpSound.play();
      }
    });
  }
  collides() {
    this.physics.add.collider(this.coinGroup, this.groundGroup, (singleCoin) => {
      singleCoin.setVelocityX(-200);
    });
    this.physics.add.overlap(this.player, this.coinGroup, (player, singleCoin) => {
      if (this.soundOn) {
        this.coinSound.play();
      }
      singleCoin.destroy();
      this.score += 1;
      this.health += 1;
      if (this.health > 120) {
        this.health = 120;
      }
      this.scoreText.setText(`${this.score}`);
      this.hoveringTextScore(player, "1+", "#0000ff");
    });
    this.physics.add.collider(this.player, this.missileGroup, (player, missile) => {
      if (player.body.touching.down && missile.body.touching.up) {
        if (this.soundOn) {
          this.killmissileSound.play();
        }
        player.setVelocityY(-300);
        missile.setVelocityY(300);
        let message = "";
        if (missile.y < this.scale.height - 200) {
          message += "+1.5";
          this.health += 1.5;
          if (this.health > 120) {
            this.health = 120;
          }
          this.missileScore += 1.5;
        } else {
          message += "+0.5";
          this.missileScore += 0.5;
          this.health += 0.5;
          if (this.health > 120) {
            this.health = 120;
          }
        }
        this.hoveringTextScore(player, message, "#00ff00");
      } else {
        if (this.soundOn) {
          this.explosionSound.play();
        }
        if (missile.y < this.scale.height - 200) {
          this.health -= 40;
        } else {
          this.health -= 20;
        }
        missile.destroy();
        player.setVelocityY(0);
        this.hoveringTextScore(player, "Damage", "#ff0000", "#ff0000");

        this.explosion.x = player.x;
        this.explosion.y = player.y;
        this.explosion.play("explode", true);
      }
    });

    this.physics.add.collider(this.coinGroup, this.boundGroup, (singleCoin) => {
      singleCoin.destroy();
    });

    this.physics.add.collider(this.missileGroup, this.boundGroup, (singleMissile) => {
      singleMissile.destroy();
    });
  }
  createMissile(height, texture) {
    const missile = this.missileGroup.create(this.scale.width + 100, height, texture);
    missile.setScale(0.1);
    missile.setDepth(6);
    missile.setSize(missile.width, missile.height - 250);
    missile.setOffset(0, 150);
  }
  hoveringTextScore(player, message, strokeColor, fillColor = "#ffffff") {
    const singleScoreText = this.add
      .text(player.x, player.y, message, {
        fontSize: "30px",
        fill: fillColor,
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 2,
        stroke: strokeColor,
      })
      .setDepth(7);
    singleScoreText.setAlpha(1);

    this.tweens.add({
      targets: singleScoreText,
      repeat: 0,
      duration: 1000,
      ease: "linear",
      alpha: 0,
      y: singleScoreText.y - 100,
      onComplete() {
        singleScoreText.destroy();
      },
    });
  }

  notify(code) {
    let message, x, y;

    if (code === 1) {
      message = "Enter your username!";

      x = 400;
      y = 100;
    } else if (code === 2) {
      message = "Invalid email!";

      x = 400;
      y = 100;
    } else if (code === 3) {
      message = "Username already taken!";

      x = 400;
      y = 100;
    } else if (code === 4) {
      message = "User removed sucessfully";

      x = 400;
      y = 40;
    } else if (code === 5) {
      message = "Code copied to clipboard";

      x = 400;
      y = 365;
    } else if (code === 6) {
      message = "Code copied to clipboard";

      x = 400;
      y = 890;
    }

    const notificationText = this.add
      .text(x, y, message, {
        fontFamily: "RakeslyRG",
        fontSize: "35px",
        color: "#f20071",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(Infinity);

    this.tweens.add({
      targets: notificationText,
      alpha: 1,
      duration: 200,

      onComplete: () => {
        this.time.addEvent({
          delay: 1000,

          callback: () => {
            this.tweens.add({
              targets: notificationText,
              alpha: 0,
              duration: 200,

              onComplete: () => {
                notificationText.destroy();
              },
            });
          },
        });
      },
    });
  }
  randomBetween(min, max) {
    return Phaser.Math.Between(min, max);
  }

  update(time, delta) {
    if (this.playing) {
      moveBackgroundPlatform(this.cloudsGroup, this.cloudsWidth, this.scale.height - 200, "clouds", speed * 0.5);
      moveBackgroundPlatform(this.mountainsGroup, this.mountainsWidth, this.scale.height, "mountains", speed * 1.5);
      moveBackgroundPlatform(this.treesGroup, this.treesWidth, this.scale.height, "trees", speed * 2.5);
      moveBackgroundPlatform(this.groundGroup, this.groundWidth, this.scale.height, "ground", speed * 4);

      if (this.health <= 0) {
        this.player.lost = true;
      }

      if (this.missileScore >= 1) {
        this.health += 1;
        if (this.health > 120) {
          this.health = 120;
        }
        this.missileScore -= 1;
      }

      this.player.anims.play("run", true);
      this.birdGroup.children.iterate((child) => {
        child.anims.play("fly", true);
      });

      this.missileGroup.children.iterate((child) => {
        child.x -= 5;
      });

      this.timer += delta;
      if (this.timer >= 5000) {
        this.createMissile(this.scale.height - 190, "missile");
        this.timer = 0;
      }

      this.secondTimer += delta;
      if (this.secondTimer >= 7000) {
        this.createMissile(this.scale.height - 240, "missile2");
        this.secondTimer = 0;
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        if (this.player.body.touching.down || (this.jump < this.jumpTimes && this.jump > 0)) {
          this.player.setVelocityY(-400);
          if (this.soundOn) {
            this.jumpSound.play();
          }

          if (this.player.body.touching.down) {
            this.jump = 0;
          }
          this.jump += 1;
        }
      }

      if (!this.player.body.touching.down) {
        this.player.anims.play("jump", true);
      }

      if (this.cursors.down.isDown) {
        if (!this.player.body.touching.down) {
          this.player.setGravityY(1300);
        }
      }

      if (this.player.body.touching.down) {
        this.player.setGravityY(800);
      }
    }
    this.checkPlayerLost();
  }
  checkPlayerLost() {
    if (this.player && this.player.lost && !this.player.ended) {
      this.player.ended = true;
      this.sound.stopAll();
      if (this.soundOn) {
        this.lostSound.play();
      }

      this.time.addEvent({
        delay: 100,
        callback: () => {
          this.cameras.main.fadeOut(500);
          this.time.addEvent({
            delay: 1000,
            callback: () => {
              this.tempHighScore = this.highScore;

              if (this.score > this.highScore) {
                this.highScore = this.score;
              }

              localStorage.setItem("axa-bird-game-highScore", this.highScore);

              localStorage.setItem("axa-bird-game-score", this.score);

              this.playing = false;

              console.log(this.remember, this.score);

              if (this.score > 0) {
                if (this.remember) {
                  this.socket.emit(
                    "scoreUpdate",
                    {
                      username: this.username,
                      email: this.email,
                      score: this.score,
                      news: this.news,
                    },
                    (unlocked) => {
                      if (unlocked) {
                        this.unlocked = unlocked;
                        this.screen = "unlocked";
                        this.scene.restart();
                      } else {
                        this.screen = "replay";
                        this.scene.restart();
                      }
                    }
                  );
                } else {
                  this.screen = "restart";
                  this.scene.restart();
                }
              } else {
                this.screen = "replay";
                this.scene.restart();
              }
            },
          });
        },
      });
    }
  }

  updateScore() {
    if (this.scoreText) {
      this.scoreText.setText(this.score);
    }
  }
}

const game = new Phaser.Game({
  parent: "game",
  type: Phaser.AUTO,
  width: 800,
  height: 1200,
  border: 2,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  input: {
    activePointers: 3,
  },
  scene: [Game],
});

window.oncontextmenu = (event) => {
  event.preventDefault();
};

console.warn = () => {
  return false;
};
