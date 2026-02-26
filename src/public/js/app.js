(() => {
  const socket = window.io?.();
  if (!socket) return;

  socket.on('message', (payload) => {
    if (!payload?.text) return;
    console.debug('[socket]', payload.text);
  });
})();
