# Crypto Ticker Ui
A small companion user interface to make the configuration of [btcticker](https://github.com/llvllch/btcticker) a bit 
easier by generating the according `config.yaml`. Additionally, it is for example possible to update the ui and the btcticker,
restart those services and restart the whole system.

## Requirements
It should work on any machine that has a NodeJs version installed. It was tested on a Raspberry Pi Zero with
NodeJs version `16.3.0` installed from [node-pi-zero](https://github.com/sdesalas/node-pi-zero).

## Quick Start
Clone the project and install all NodeJs dependencies
```shell
cd ~
git clone https://github.com/thorstenbe/cryptotickerui.git
cd cryptotickerui
npm ci
```
Prepare the configuration by copying the env and password files
```shell
cp .password_example .password
cp .env_example .env
```
Either start the service by calling `./start.sh` or see the ['Add Autostart'](#add-autostart) section.

Open `http://localhost:3000`. If you've copied the `.password_example`, then login password is `crypto` and can be changed
after logging in. Please see the [Configuration](#configuration) section on how and what to configure.

## Add Autostart
Add a `systemd` service

```shell
cat <<EOF | sudo tee /etc/systemd/system/cryptotickerui.service
[Unit]
Description=cryptotickerui
After=network.target

[Service]
ExecStart=/home/pi/cryptotickerui/start.sh
WorkingDirectory=/home/pi/cryptotickerui/
StandardOutput=inherit
StandardError=inherit
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
EOF
```
and enable and start it
```shell
sudo systemctl enable cryptotickerui.service
sudo systemctl start cryptotickerui.service
```

## Configuration
All configuration should be done in a `.env` file which must be on root level. As a reference, one can copy the
`.env_example` file. All configuration values are

| Key                       | Value                                                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| HOSTNAME                  | Hostname to listen to. Can also be a specific ip address<br/>_Default:_ 0.0.0.0                                                 |
| PORT                      | Port to listen to<br/>_Default:_ 3000                                                                                           |
| TOKEN_SECRET              | Secret that is used to sign the JSON Web Token (JWT). This is not the used password to login, so it may be a long random string |
| BTCTICKER_PATH            | Path to the _btcticker_ project. Used to read the `config.yaml` and update the project using `git`                              |
| RESTART_TICKER_COMMAND    | Shell command that will be executed when the _btcticker_ should be restarted                                                    |
| STOP_TICKER_COMMAND       | Shell command that will be executed when the _btcticker_ should be stopped                                                      |
| RESTART_TICKER_UI_COMMAND | Shell command that will be executed when the crypto ticker ui should be restarted                                               |
| RESTART_SYSTEM_COMMAND    | Shell command that will be executed when the whole system should be restarted                                                   |
| SHUTDOWN_SYSTEM_COMMAND   | Shell command that will be executed when the whole system should be shutdown                                                    |
| LOG_LEVEL                 | Setting the log level of the application<br/>_Default:_ info                                                                    |
| ADD_WIFI_COMMAND          | **This is a more experimental feature** <br/> Shell Command that will be executed when a new WiFi connection should be added. To this command a network template will be piped that can be used to put into the `wpa_supplicant.conf` and looks like this<br/>`network={`<br/>`ssid="<SSID>"`<br/>`psk=<PASSWORD>`<br/>`priority=<PRIORITY>`<br/>`}`  |

All shell commands must be executable by the user that starts the Crypto Ticker Ui. Therefore, it may be necessary to 
update the `sudoers` file to allow some commands without a `sudo` password.

## Contributing
Pull requests are welcome. Please fork this repo, create a feature branch and open a pull request.