export function showToast(message) {
    M.toast({html: message});
}

export function showErrorToast() {
    showToast('An unexpected error occurred. Please try again.');
}