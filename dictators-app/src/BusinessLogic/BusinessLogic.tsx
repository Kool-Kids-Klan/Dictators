import React from 'react';
import { SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { currentGameSocket } from '../store/selectors';
import { appState, gameState, lobbyState } from '../store/atoms';
import { ILobby, IPlayer } from '../resources/types/types';

const changeUser = (players: ILobby, setPlayers: SetterOrUpdater<ILobby>,
  changedPlayer: IPlayer) => {
  const index = players.players.findIndex((player) => player.name === changedPlayer.name);
  if (index === -1) {
    alert('did not find user that want to change');
  } else {
    setPlayers({
      players: [
        ...players.players.slice(0, index), changedPlayer, ...players.players.slice(index + 1),
      ],
    });
  }
};

export const connect = () => {
  const [, setGame] = useRecoilState(gameState);
  const gameSocket = useRecoilValue(currentGameSocket);
  const { username } = useRecoilValue(appState);
  const [players, setPlayers] = useRecoilState(lobbyState);
  const history = useHistory();
  gameSocket.onopen = function open() {
    console.log('WebSockets connection created.');
    // on websocket open, send the START event.
    gameSocket.send(JSON.stringify({
      event: 'JOIN_ROOM',
      message: username,
    }));
  };

  gameSocket.onclose = function close(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(() => {
      connect();
    }, 1000);
  };

  gameSocket.onmessage = function onMessage(e) {
    // On getting the message from the server
    // Do the appropriate steps on each event.
    let data = JSON.parse(e.data);
    console.log('recieved new message', data);
    data = data.payload;
    const { message } = data;
    const { event } = data;
    switch (event) {
      case 'START':
        history.push('/game');
        break;
      case 'END':
        alert(message);
        break;
        // case "MOVE":
        //   if(message["player"] !== char_choice){
        //     make_move(message["index"], message["player"])
        //     myturn = true;
        //     document.getElementById("alert_move").style.display = 'inline';
        //   }
        //   break;
      case 'GAME_BOARD':
        setGame({ game: message });
        console.log('game board', message);
        break;
      case 'TICK':
        console.log('this is thick', message);
        setGame({ game: message });
        break;
      case 'JOIN_USER':
        console.log('this are connected users', message);
        setPlayers({ players: message.players });
        break;
      case 'LOAD_MAP':
        console.log('trying to load map');
        setGame({ game: message });
        break;
      case 'USER_READY':
        console.log('this user is ready', message);
        changeUser(players, setPlayers, message);
        break;
      case 'USER_NOT_READY':
        console.log('this user is not ready', message);
        changeUser(players, setPlayers, message);
        break;
      default:
        console.log('No event');
    }
  };

  // if (gameSocket.readyState === WebSocket.OPEN) {
  //   gameSocket.onopen();
  // }
};

export default connect;
