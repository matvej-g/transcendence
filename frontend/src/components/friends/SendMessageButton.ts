// SendMessageButton.ts
// Reusable send message button for friends features

export function setupSendMessageButton(sendMsgBtn: HTMLElement, searchResultUser: HTMLElement, showMessage: (msg: string, color: string) => void, getFriendUser: () => any) {
  sendMsgBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const friendUser = getFriendUser();
    if (!friendUser || !friendUser.id) {
      showMessage('No user selected.', 'text-red-400');
      return;
    }
    // Here you can implement the actual send message logic
    showMessage('Send message feature coming soon!', 'text-green-500');
    // Optionally hide the button or user row if needed
    // sendMsgBtn.classList.add('hidden');
    // searchResultUser.classList.add('hidden');
  });
}
