function Button({ className = "", variant = "default", disabled, children, ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 font-black transition active:scale-95";
  const styles =
    variant === "outline"
      ? "border-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
      : variant === "secondary"
      ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button
      className={`${base} ${styles} ${disabled ? "cursor-not-allowed opacity-45" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ className = "", children }) {
  return <div className={`bg-white ${className}`}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
const DIE_VALUES = [-2, -1, 0, 1, 2, 3];
const OPS = ['+', '-', '×'];
const LIMIT = 20;
const SCALE = 14;
const PLAYER_COLORS = [
  { name: '파랑', fill: '#2563eb', light: '#dbeafe' },
  { name: '빨강', fill: '#dc2626', light: '#fee2e2' },
  { name: '초록', fill: '#16a34a', light: '#dcfce7' },
  { name: '보라', fill: '#9333ea', light: '#f3e8ff' },
  { name: '주황', fill: '#ea580c', light: '#ffedd5' },
  { name: '분홍', fill: '#db2777', light: '#fce7f3' },
];

function Button({ className = '', variant = 'default', disabled, children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45';
  const styles = variant === 'outline'
    ? 'border-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
    : variant === 'secondary'
      ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
      : 'bg-slate-900 text-white hover:bg-slate-800';
  return <button className={`${base} ${styles} ${className}`} disabled={disabled} {...props}>{children}</button>;
}

function Card({ className = '', children }) {
  return <div className={`bg-white ${className}`}>{children}</div>;
}

function CardContent({ className = '', children }) {
  return <div className={className}>{children}</div>;
}

function rollDie() {
  return DIE_VALUES[Math.floor(Math.random() * DIE_VALUES.length)];
}

function formatComplex(z) {
  const a = z.re;
  const b = z.im;
  if (a === 0 && b === 0) return '0';
  if (b === 0) return `${a}`;
  if (a === 0) return b === 1 ? 'i' : b === -1 ? '-i' : `${b}i`;
  const sign = b > 0 ? '+' : '-';
  const absB = Math.abs(b);
  const im = absB === 1 ? 'i' : `${absB}i`;
  return `${a} ${sign} ${im}`;
}

function add(z, w) { return { re: z.re + w.re, im: z.im + w.im }; }
function sub(z, w) { return { re: z.re - w.re, im: z.im - w.im }; }
function mul(z, w) { return { re: z.re * w.re - z.im * w.im, im: z.re * w.im + z.im * w.re }; }
function operate(z, w, op) { return op === '+' ? add(z, w) : op === '-' ? sub(z, w) : mul(z, w); }
function distance(z, target = { re: 0, im: 0 }) { return Math.sqrt((z.re - target.re) ** 2 + (z.im - target.im) ** 2); }
function inBounds(z) { return Math.abs(z.re) <= LIMIT && Math.abs(z.im) <= LIMIT; }
function samePoint(a, b) { return a.re === b.re && a.im === b.im; }

function playTone(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = type === 'success' ? 720 : 170;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (_) {}
}

function DiceBox({ value, label, rolling }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-black text-slate-500">{label}</div>
      <motion.div
        animate={rolling ? { rotate: [0, 18, -18, 12, -12, 0], y: [0, -8, 5, -4, 0], scale: [1, 1.1, 0.96, 1.05, 1] } : { rotate: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.65 }}
        className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-slate-300 bg-white text-4xl font-black shadow-lg"
      >
        {value ?? '?'}
      </motion.div>
    </div>
  );
}

function GameBoard({ players, currentPlayerIndex, target, history, mode, pendingWrong, onPickPoint }) {
  const size = LIMIT * 2 * SCALE;
  const center = size / 2;
  const toX = (x) => center + x * SCALE;
  const toY = (y) => center - y * SCALE;

  function handlePointerDown(event) {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * size;
    const svgY = ((event.clientY - rect.top) / rect.height) * size;
    const re = Math.round((svgX - center) / SCALE);
    const im = Math.round((center - svgY) / SCALE);
    if (Number.isFinite(re) && Number.isFinite(im) && Math.abs(re) <= LIMIT && Math.abs(im) <= LIMIT) onPickPoint({ re, im });
  }

  const gridLines = [];
  for (let i = -LIMIT; i <= LIMIT; i++) {
    const strong = i === 0 || i % 5 === 0;
    gridLines.push(<line key={`v-${i}`} x1={toX(i)} y1={0} x2={toX(i)} y2={size} strokeWidth={i === 0 ? 2.4 : strong ? 1 : 0.55} className={i === 0 ? 'stroke-slate-900' : strong ? 'stroke-slate-300' : 'stroke-slate-100'} />);
    gridLines.push(<line key={`h-${i}`} x1={0} y1={toY(i)} x2={size} y2={toY(i)} strokeWidth={i === 0 ? 2.4 : strong ? 1 : 0.55} className={i === 0 ? 'stroke-slate-900' : strong ? 'stroke-slate-300' : 'stroke-slate-100'} />);
  }

  const labels = [];
  for (let i = -20; i <= 20; i += 5) {
    if (i !== 0) {
      labels.push(<text key={`x-label-${i}`} x={toX(i) - 6} y={center + 18} className="pointer-events-none fill-slate-500 text-[11px] font-bold">{i}</text>);
      labels.push(<text key={`y-label-${i}`} x={center + 7} y={toY(i) + 4} className="pointer-events-none fill-slate-500 text-[11px] font-bold">{i}</text>);
    }
  }

  return (
    <div className="rounded-[2rem] border-4 border-slate-900 bg-white p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="text-xl font-black">복소평면</div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-black text-white">범위 -20 ~ 20</div>
      </div>
      <div className="w-full overflow-auto rounded-3xl bg-slate-50 p-2">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block touch-none select-none rounded-2xl" onPointerDown={handlePointerDown}>
          <rect width={size} height={size} className="fill-white" />
          {gridLines}
          {labels}
          <text x={size - 32} y={center - 10} className="pointer-events-none fill-slate-700 text-sm font-black">Re</text>
          <text x={center + 10} y={20} className="pointer-events-none fill-slate-700 text-sm font-black">Im</text>

          {history.slice().reverse().map((h, idx) => <circle key={`hist-${idx}`} cx={toX(h.after.re)} cy={toY(h.after.im)} r={4} fill={h.playerColor || '#94a3b8'} opacity={0.32} className="pointer-events-none" />)}

          {mode === 'target' && target && (
            <g className="pointer-events-none">
              <circle cx={toX(target.re)} cy={toY(target.im)} r={10} className="fill-rose-500" />
              <circle cx={toX(target.re)} cy={toY(target.im)} r={20} className="fill-rose-500" opacity={0.16} />
              <text x={toX(target.re) + 14} y={toY(target.im) - 14} className="fill-rose-700 text-xs font-black">목표 {formatComplex(target)}</text>
            </g>
          )}

          <AnimatePresence>
            {pendingWrong && (
              <motion.g key={`${pendingWrong.re},${pendingWrong.im}`} initial={{ opacity: 1, scale: 0.5 }} animate={{ opacity: [1, 1, 0], scale: [0.5, 1.5, 1.1] }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="pointer-events-none">
                <circle cx={toX(pendingWrong.re)} cy={toY(pendingWrong.im)} r={15} className="fill-red-500" opacity={0.25} />
                <line x1={toX(pendingWrong.re) - 10} y1={toY(pendingWrong.im) - 10} x2={toX(pendingWrong.re) + 10} y2={toY(pendingWrong.im) + 10} className="stroke-red-600" strokeWidth={4} />
                <line x1={toX(pendingWrong.re) + 10} y1={toY(pendingWrong.im) - 10} x2={toX(pendingWrong.re) - 10} y2={toY(pendingWrong.im) + 10} className="stroke-red-600" strokeWidth={4} />
              </motion.g>
            )}
          </AnimatePresence>

          {players.map((player, idx) => {
            const isCurrent = idx === currentPlayerIndex;
            const offset = players.length > 1 ? (idx - (players.length - 1) / 2) * 5 : 0;
            return (
              <motion.g key={player.id} className="pointer-events-none" animate={{ x: toX(player.position.re) + offset, y: toY(player.position.im) + offset }} transition={{ type: 'spring', stiffness: 130, damping: 15 }}>
                <circle r={isCurrent ? 24 : 18} fill={player.color.fill} opacity={0.12} />
                <motion.circle r={isCurrent ? 13 : 10} animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.55 }} fill={player.color.fill} stroke={isCurrent ? '#111827' : 'white'} strokeWidth={isCurrent ? 4 : 2} />
                <text x={15} y={5} fill={player.color.fill} className="text-xs font-black">{player.name}</text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function PlayerSetup({ playerCount, players, roundsPerPlayer, setRoundsPerPlayer, setCount, setPlayerColor, setPlayerName, startGame }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-5 rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="rounded-[2rem] bg-slate-900 p-6 text-white">
          <h1 className="text-4xl font-black">복소수 좌표 게임</h1>
          <p className="mt-2 text-lg text-slate-200">참가자와 말 색을 고른 뒤 게임을 시작하세요.</p>
        </div>

        <div className="rounded-3xl border-2 p-5">
          <div className="mb-4 text-xl font-black">참가 인원수</div>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((count) => <Button key={count} className="h-14 rounded-2xl text-lg" variant={playerCount === count ? 'default' : 'outline'} onClick={() => setCount(count)}>{count}명</Button>)}
          </div>
        </div>

        <div className="rounded-3xl border-2 p-5">
          <div className="mb-4 text-xl font-black">각자 몇 번씩 할까요?</div>
          <input type="number" min="1" max="10" value={roundsPerPlayer} onChange={(event) => setRoundsPerPlayer(Math.max(1, Number(event.target.value) || 1))} className="w-full rounded-3xl border-2 border-slate-300 px-5 py-4 text-3xl font-black outline-none focus:border-slate-900" />
          <p className="mt-2 text-sm font-bold text-slate-500">추천: 1차 4~5턴. 3턴은 짧고, 6턴 이상은 계산 피로도가 커질 수 있습니다.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {players.map((player, idx) => (
            <div key={player.id} className="rounded-3xl border-2 p-5" style={{ backgroundColor: player.color.light }}>
              <div className="mb-4 flex items-center gap-3 text-xl font-black">
                <span className="inline-block h-7 w-7 rounded-full shadow" style={{ backgroundColor: player.color.fill }} />
                <input value={player.name} onChange={(event) => setPlayerName(idx, event.target.value)} placeholder={`${idx + 1}번 이름`} className="min-w-0 flex-1 rounded-2xl border-2 border-white bg-white/80 px-4 py-3 text-xl font-black outline-none focus:border-slate-900" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PLAYER_COLORS.map((color) => {
                  const isSelectedByThisPlayer = player.color.name === color.name;
                  const isTakenByOtherPlayer = players.some((p, playerIdx) => playerIdx !== idx && p.color.name === color.name);
                  return (
                    <button key={color.name} onClick={() => setPlayerColor(idx, color)} disabled={isTakenByOtherPlayer} className={`rounded-2xl border-4 p-3 text-sm font-black transition ${isSelectedByThisPlayer ? 'scale-105 border-slate-900' : 'border-white'} ${isTakenByOtherPlayer ? 'cursor-not-allowed opacity-35' : ''}`} style={{ backgroundColor: color.light }}>
                      <span className="mx-auto mb-1 block h-8 w-8 rounded-full" style={{ backgroundColor: color.fill }} />
                      {color.name}
                      {isTakenByOtherPlayer && <span className="mt-1 block text-[10px]">선택됨</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Button className="h-16 w-full rounded-3xl text-2xl" onClick={startGame}>게임 시작</Button>
      </div>
    </div>
  );
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [roundsPerPlayer, setRoundsPerPlayer] = useState(4);
  const [turnCounts, setTurnCounts] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [phaseResults, setPhaseResults] = useState({ random: null, target: null });
  const [finalResult, setFinalResult] = useState(null);
  const [players, setPlayers] = useState([
    { id: 1, name: '1번', color: PLAYER_COLORS[0], position: { re: 0, im: 0 } },
    { id: 2, name: '2번', color: PLAYER_COLORS[1], position: { re: 0, im: 0 } },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [mode, setMode] = useState('random');
  const [candidate, setCandidate] = useState(null);
  const [pendingTurn, setPendingTurn] = useState(null);
  const [selectedOp, setSelectedOp] = useState('+');
  const [randomOp, setRandomOp] = useState('+');
  const [opBag, setOpBag] = useState([...OPS]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('주사위를 굴린 뒤, 직접 계산하고 좌표평면에 정답 위치를 찍으세요.');
  const [target, setTarget] = useState({ re: 6, im: -4 });
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState([null, null]);
  const [pendingWrong, setPendingWrong] = useState(null);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [turnAdvancing, setTurnAdvancing] = useState(false);

  const currentPlayer = players[currentPlayerIndex] || players[0];
  const currentOp = pendingTurn?.op ?? (mode === 'random' ? randomOp : selectedOp);
  const expected = useMemo(() => pendingTurn ? operate(pendingTurn.before, pendingTurn.number, pendingTurn.op) : null, [pendingTurn]);

  function setCount(count) {
    setPlayerCount(count);
    const nextPlayers = Array.from({ length: count }, (_, idx) => players[idx] || { id: idx + 1, name: `${idx + 1}번`, color: PLAYER_COLORS[idx % PLAYER_COLORS.length], position: { re: 0, im: 0 } })
      .map((p, idx) => ({ ...p, id: idx + 1, name: p.name || `${idx + 1}번` }));
    setPlayers(nextPlayers);
    setCurrentPlayerIndex(0);
    setTurnCounts(nextPlayers.map(() => 0));
    setGameOver(false);
    setWinner(null);
    setOpBag([...OPS]);
    setTurnAdvancing(false);
  }

  function setPlayerColor(index, color) {
    setPlayers((prev) => {
      const isTaken = prev.some((p, idx) => idx !== index && p.color.name === color.name);
      if (isTaken) return prev;
      return prev.map((p, idx) => idx === index ? { ...p, color } : p);
    });
  }

  function setPlayerName(index, name) {
    setPlayers((prev) => prev.map((p, idx) => idx === index ? { ...p, name: name.trimStart() || `${idx + 1}번` } : p));
  }

  function resetCommon() {
    setHistory([]);
    setCandidate(null);
    setPendingTurn(null);
    setDisplayDice([null, null]);
    setCurrentPlayerIndex(0);
    setTurnCounts(players.map(() => 0));
    setGameOver(false);
    setWinner(null);
    setOpBag([...OPS]);
    setTurnAdvancing(false);
    setPendingWrong(null);
    setLastFeedback(null);
  }

  function startGame() {
    const resetPlayers = players.map((p) => ({ ...p, position: { re: 0, im: 0 } }));
    setPlayers(resetPlayers);
    setMode('random');
    setPhaseResults({ random: null, target: null });
    setFinalResult(null);
    resetCommon();
    setGameStarted(true);
    setMessage(`${resetPlayers[0]?.name || '1번'} 차례입니다. 주사위를 굴리세요.`);
  }

  function backToSetup() {
    setGameStarted(false);
    setPhaseResults({ random: null, target: null });
    setFinalResult(null);
    resetCommon();
  }

  function makeRankings(finalPlayers, gameMode) {
    return finalPlayers
      .map((player) => ({
        id: player.id,
        name: player.name,
        color: player.color,
        position: player.position,
        distance: gameMode === 'target' ? distance(player.position, target) : distance(player.position),
      }))
      .sort((a, b) => gameMode === 'target' ? a.distance - b.distance : b.distance - a.distance)
      .map((player, idx) => ({ ...player, rank: idx + 1, point: finalPlayers.length - idx }));
  }

  function getWinner(finalPlayers, gameMode = mode) {
    const ranked = makeRankings(finalPlayers, gameMode);
    const best = ranked[0];
    return best ? { ...best, score: best.distance } : null;
  }

  function calculateFinalResult(nextPhaseResults, playerList) {
    const randomRows = nextPhaseResults.random || [];
    const targetRows = nextPhaseResults.target || [];
    const rows = playerList.map((player) => {
      const random = randomRows.find((row) => row.id === player.id);
      const targetRow = targetRows.find((row) => row.id === player.id);
      const randomPoint = random?.point || 0;
      const targetPoint = targetRow?.point || 0;
      return { id: player.id, name: player.name, color: player.color, randomPoint, targetPoint, totalPoint: randomPoint + targetPoint * 2 };
    }).sort((a, b) => b.totalPoint - a.totalPoint || b.targetPoint - a.targetPoint || b.randomPoint - a.randomPoint);
    return { rows, winner: rows[0] || null };
  }

  function finishGame(finalPlayers) {
    const finalWinner = getWinner(finalPlayers, mode);
    const ranking = makeRankings(finalPlayers, mode);
    const nextPhaseResults = { ...phaseResults, [mode]: ranking };
    const nextFinalResult = mode === 'target' ? calculateFinalResult(nextPhaseResults, finalPlayers) : null;
    setWinner(finalWinner);
    setPhaseResults(nextPhaseResults);
    setFinalResult(nextFinalResult);
    setGameOver(true);
    setCandidate(null);
    setPendingTurn(null);
    setTurnAdvancing(false);
    if (mode === 'target') setMessage(`2차 게임 종료! 2차 승자는 ${finalWinner.name} 입니다.`);
    else setMessage(`1차 게임 종료! 1차 승자는 ${finalWinner.name} 입니다. 2차 게임으로 넘어가세요.`);
  }

  function moveToNextTurn(fromIndex = currentPlayerIndex, delay = 750, updatedCounts = turnCounts, updatedPlayers = players) {
    setTurnAdvancing(true);
    window.setTimeout(() => {
      const allDone = updatedCounts.every((count) => count >= roundsPerPlayer);
      if (allDone) {
        finishGame(updatedPlayers);
        return;
      }
      let nextIndex = (fromIndex + 1) % updatedPlayers.length;
      let guard = 0;
      while (updatedCounts[nextIndex] >= roundsPerPlayer && guard < updatedPlayers.length) {
        nextIndex = (nextIndex + 1) % updatedPlayers.length;
        guard += 1;
      }
      setCurrentPlayerIndex(nextIndex);
      setCandidate(null);
      setPendingTurn(null);
      setDisplayDice([null, null]);
      setLastFeedback(null);
      setPendingWrong(null);
      setTurnAdvancing(false);
      setMessage(`${updatedPlayers[nextIndex].name} 차례입니다. 주사위를 굴리세요.`);
    }, delay);
  }

  function nextTurn() {
    if (rolling || candidate || turnAdvancing || gameOver) return;
    moveToNextTurn(currentPlayerIndex, 0);
  }

  function updatePlayerPosition(playerIndex, nextPosition) {
    const updatedPlayers = players.map((p, idx) => idx === playerIndex ? { ...p, position: nextPosition } : p);
    setPlayers(updatedPlayers);
    return updatedPlayers;
  }

  function completeTurn(playerIndex, finalPlayers, delay = 900) {
    const updatedCounts = turnCounts.map((count, idx) => idx === playerIndex ? count + 1 : count);
    setTurnCounts(updatedCounts);
    moveToNextTurn(playerIndex, delay, updatedCounts, finalPlayers);
  }

  function drawOperation() {
    const bag = opBag.length > 0 ? opBag : [...OPS];
    const index = Math.floor(Math.random() * bag.length);
    const picked = bag[index];
    setOpBag(bag.filter((_, idx) => idx !== index));
    return picked;
  }

  function roll() {
    if (rolling || candidate || turnAdvancing || gameOver) return;
    setLastFeedback(null);
    setPendingWrong(null);
    setRolling(true);
    let ticks = 0;
    const interval = window.setInterval(() => {
      setDisplayDice([rollDie(), rollDie()]);
      ticks += 1;
      if (ticks >= 10) {
        window.clearInterval(interval);
        const next = { re: rollDie(), im: rollDie() };
        const op = drawOperation();
        const fixedOp = mode === 'random' ? op : selectedOp;
        const fixedTurn = { playerIndex: currentPlayerIndex, playerName: currentPlayer.name, playerColor: currentPlayer.color.fill, before: { ...currentPlayer.position }, number: next, op: fixedOp };
        setDisplayDice([next.re, next.im]);
        setCandidate(next);
        setPendingTurn(fixedTurn);
        setRandomOp(op);
        setRolling(false);
        setMessage(`${fixedTurn.playerName}: ${formatComplex(fixedTurn.before)} ${fixedTurn.op} (${formatComplex(next)}) 를 계산하고 도착점을 찍으세요.`);
      }
    }, 65);
  }

  function recordAttempt(turn, picked, expectedPoint, accepted, reason) {
    if (!turn || !expectedPoint) return;
    const record = { turn: history.length + 1, before: turn.before, number: turn.number, op: turn.op, picked, expected: expectedPoint, after: accepted ? expectedPoint : turn.before, playerName: turn.playerName, playerColor: turn.playerColor, accepted, reason };
    setHistory((prev) => [record, ...prev]);
  }

  function handlePickPoint(picked) {
    const turn = pendingTurn;
    if (!turn) { setMessage('먼저 주사위를 굴리세요.'); return; }
    const expectedPoint = operate(turn.before, turn.number, turn.op);
    if (!inBounds(expectedPoint)) {
      recordAttempt(turn, picked, expectedPoint, false, '범위 밖');
      setCandidate(null);
      setPendingTurn(null);
      setPendingWrong(picked);
      setLastFeedback('fail');
      playTone('fail');
      setMessage(`정답은 ${formatComplex(expectedPoint)} 이지만 게임판 범위 밖입니다. 이번 턴은 이동하지 않습니다.`);
      window.setTimeout(() => setPendingWrong(null), 850);
      completeTurn(turn.playerIndex, players, 950);
      return;
    }
    if (samePoint(picked, expectedPoint)) {
      recordAttempt(turn, picked, expectedPoint, true, '정답');
      const updatedPlayers = updatePlayerPosition(turn.playerIndex, expectedPoint);
      setCandidate(null);
      setPendingTurn(null);
      setLastFeedback('success');
      playTone('success');
      setMessage(`정답! ${turn.playerName} 말이 ${formatComplex(expectedPoint)} 에 안착했습니다.`);
      completeTurn(turn.playerIndex, updatedPlayers, 900);
    } else {
      setPendingWrong(picked);
      setLastFeedback('fail');
      playTone('fail');
      setMessage(`삑! ${formatComplex(picked)} 은/는 정답 위치가 아닙니다. 다시 계산해 보세요.`);
      window.setTimeout(() => setPendingWrong(null), 850);
    }
  }

  function reset() {
    const resetPlayers = players.map((p) => ({ ...p, position: { re: 0, im: 0 } }));
    setPlayers(resetPlayers);
    if (mode === 'random') {
      setPhaseResults({ random: null, target: null });
      setFinalResult(null);
    } else {
      setPhaseResults((prev) => ({ ...prev, target: null }));
      setFinalResult(null);
    }
    resetCommon();
    setMessage('새 판을 시작합니다. 첫 번째 참가자 차례입니다. 주사위를 굴리세요.');
  }

  function startTargetGame() {
    if (candidate || rolling || turnAdvancing) return;
    const resetPlayers = players.map((p) => ({ ...p, position: { re: 0, im: 0 } }));
    setPlayers(resetPlayers);
    setMode('target');
    setPhaseResults((prev) => ({ ...prev, target: null }));
    setFinalResult(null);
    resetCommon();
    setMessage(`2차 게임 시작! 모든 말을 원점으로 되돌렸습니다. ${resetPlayers[0]?.name || '1번'} 차례입니다. 주사위를 굴리세요.`);
  }

  function randomTarget() { setTarget({ re: rollDie() * 3, im: rollDie() * 3 }); }

  const currentScore = mode === 'target' ? distance(currentPlayer.position, target) : distance(currentPlayer.position);

  if (!gameStarted) return <PlayerSetup playerCount={playerCount} players={players} roundsPerPlayer={roundsPerPlayer} setRoundsPerPlayer={setRoundsPerPlayer} setCount={setCount} setPlayerColor={setPlayerColor} setPlayerName={setPlayerName} startGame={startGame} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-3 text-slate-900 md:p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] bg-slate-900 p-4 text-white shadow-2xl">
              <div>
                <div className="text-sm font-black text-blue-200">COMPLEX PLANE GAME</div>
                <h1 className="text-3xl font-black">복소수 좌표 게임</h1>
                <div className="mt-1 text-sm font-bold text-slate-300">각자 {roundsPerPlayer}턴 · 완료 {turnCounts.reduce((sum, count) => sum + count, 0)} / {players.length * roundsPerPlayer}</div>
              </div>
              <div className="flex gap-2">
                <Button className="rounded-2xl" variant={mode === 'random' ? 'secondary' : 'outline'} onClick={() => { if (!candidate && !rolling && !turnAdvancing) setMode('random'); }} disabled={!!candidate}>1차: 멀리 가기</Button>
                <Button className="rounded-2xl" variant={mode === 'target' ? 'secondary' : 'outline'} onClick={startTargetGame} disabled={!!candidate}>2차: 목표점</Button>
              </div>
            </div>
            <GameBoard players={players} currentPlayerIndex={currentPlayerIndex} target={target} history={history} mode={mode} pendingWrong={pendingWrong} onPickPoint={handlePickPoint} />
          </div>

          <div className="space-y-4">
            <Card className={`rounded-[2rem] border-4 shadow-2xl ${lastFeedback === 'success' ? 'border-green-400' : lastFeedback === 'fail' ? 'border-red-400' : 'border-slate-900'}`}>
              <CardContent className="space-y-4 p-5">
                <div className="rounded-3xl p-4" style={{ backgroundColor: currentPlayer.color.light }}>
                  <div className="mb-2 text-sm font-black text-slate-600">현재 차례</div>
                  <div className="flex items-center gap-3 text-4xl font-black"><span className="inline-block h-9 w-9 rounded-full shadow" style={{ backgroundColor: currentPlayer.color.fill }} />{currentPlayer.name}</div>
                  <div className="mt-2 text-xl font-black">현재 위치: ({currentPlayer.position.re}, {currentPlayer.position.im})</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-slate-100 p-4 text-center"><div className="text-sm font-black text-slate-500">현재 위치</div><div className="text-3xl font-black">({currentPlayer.position.re}, {currentPlayer.position.im})</div></div>
                  <div className="rounded-3xl bg-slate-100 p-4 text-center"><div className="text-sm font-black text-slate-500">이번 연산</div><div className="text-5xl font-black">{candidate ? currentOp : '-'}</div></div>
                </div>

                <div className="rounded-3xl bg-slate-900 p-4 text-lg font-black leading-relaxed text-white">{message}</div>

                {gameOver && winner && (
                  <div className="rounded-3xl bg-yellow-100 p-5 text-center ring-4 ring-yellow-400">
                    <div className="text-lg font-black text-yellow-800">{mode === 'random' ? '1차 결과' : '2차 결과'}</div>
                    <div className="mt-1 text-4xl font-black" style={{ color: winner.color.fill }}>승자: {winner.name}</div>
                    <div className="mt-1 text-sm font-bold text-yellow-900">{mode === 'random' ? `원점에서 거리 ${winner.score.toFixed(2)}` : `목표점까지 거리 ${winner.score.toFixed(2)}`}</div>

                    {mode === 'target' && finalResult?.winner && (
                      <details className="mt-4 rounded-2xl bg-white p-4 text-left">
                        <summary className="cursor-pointer text-center text-lg font-black text-slate-900">최종 승리자 확인하기</summary>
                        <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-center">
                          <div className="text-sm font-black text-slate-500">최종 우승</div>
                          <div className="mt-1 text-4xl font-black" style={{ color: finalResult.winner.color.fill }}>{finalResult.winner.name}</div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {finalResult.rows.map((row) => (
                            <div key={row.id} className="flex items-center justify-between rounded-2xl bg-white p-3 font-black">
                              <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full" style={{ backgroundColor: row.color.fill }} />{row.name}</div>
                              <div>{row.randomPoint} + {row.targetPoint}×2 = {row.totalPoint}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 rounded-3xl bg-slate-50 p-4"><DiceBox label="실수부" value={displayDice[0]} rolling={rolling} /><DiceBox label="허수부" value={displayDice[1]} rolling={rolling} /></div>
                <div className="rounded-3xl border-2 p-4 text-center"><div className="text-sm font-black text-slate-500">나온 복소수</div><div className="text-4xl font-black">{candidate ? formatComplex(candidate) : '-'}</div></div>

                {mode === 'target' && (
                  <div className="rounded-3xl border-2 p-4">
                    <div className="mb-3 text-lg font-black">연산 선택</div>
                    <div className="grid grid-cols-3 gap-3">{OPS.map((op) => <Button key={op} className="h-16 rounded-3xl text-3xl" variant={selectedOp === op ? 'default' : 'outline'} onClick={() => setSelectedOp(op)} disabled={!!candidate}>{op}</Button>)}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3"><Button className="h-16 rounded-3xl text-xl" onClick={roll} disabled={rolling || !!candidate || turnAdvancing || gameOver}>{turnAdvancing ? '차례 전환' : rolling ? '굴리는 중' : '주사위'}</Button><Button className="h-16 rounded-3xl text-xl" variant="secondary" onClick={nextTurn} disabled={rolling || !!candidate || turnAdvancing || gameOver}>차례 넘기기</Button></div>
                <div className="grid grid-cols-2 gap-3"><Button className="rounded-2xl" variant="outline" onClick={reset}>새 판</Button><Button className="rounded-2xl" variant="outline" onClick={backToSetup}>설정</Button></div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-4 border-slate-900 shadow-xl">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-2"><h2 className="text-2xl font-black">참가자 현황</h2>{mode === 'target' && <Button variant="outline" className="rounded-2xl" onClick={randomTarget} disabled={!!candidate}>목표 변경</Button>}</div>
                {mode === 'random' ? <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900">1차 게임: 원점에서 멀수록 유리합니다.</div> : <div className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-900">2차 게임: 목표점 {formatComplex(target)} 에 가까울수록 유리합니다.</div>}
                <div className="grid gap-2">
                  {players.map((player, idx) => {
                    const playerScore = mode === 'target' ? distance(player.position, target) : distance(player.position);
                    return <div key={player.id} className={`flex items-center justify-between rounded-2xl p-3 ${idx === currentPlayerIndex ? 'ring-4 ring-slate-900' : ''}`} style={{ backgroundColor: player.color.light }}><div className="flex items-center gap-2 font-black"><span className="h-6 w-6 rounded-full" style={{ backgroundColor: player.color.fill }} />{player.name} · ({player.position.re}, {player.position.im}) · {turnCounts[idx] || 0}/{roundsPerPlayer}턴</div><div className="text-xl font-black">{playerScore.toFixed(2)}</div></div>;
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-2 shadow-lg">
              <CardContent className="p-5">
                <h2 className="mb-3 text-xl font-black">계산 기록지</h2>
                <div className="max-h-64 overflow-auto rounded-2xl border">
                  <table className="w-full text-sm"><thead className="sticky top-0 bg-slate-100"><tr><th className="p-2 text-left">턴</th><th className="p-2 text-left">참가자</th><th className="p-2 text-left">계산</th><th className="p-2 text-left">선택</th><th className="p-2 text-left">판정</th></tr></thead><tbody>{history.length === 0 ? <tr><td className="p-3 text-slate-500" colSpan={5}>아직 기록이 없습니다.</td></tr> : history.map((h) => <tr key={h.turn} className="border-t"><td className="p-2">{h.turn}</td><td className="p-2"><span className="mr-1 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: h.playerColor }} />{h.playerName}</td><td className="p-2">{formatComplex(h.before)} {h.op} ({formatComplex(h.number)})</td><td className="p-2">{formatComplex(h.picked)}</td><td className={`p-2 font-black ${h.accepted ? 'text-green-700' : 'text-red-700'}`}>{h.accepted ? '정답' : h.reason}</td></tr>)}</tbody></table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
