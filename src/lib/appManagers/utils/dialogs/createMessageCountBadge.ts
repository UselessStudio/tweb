

export default function createMessageCountBadge(count: number) {
  const badge = document.createElement('div');
  badge.className = `badge badge-22 message-count`;
  badge.innerText = `${count}`;
  return badge;
}
