// HMR Test Entry Point
console.log('🚀 App loaded - HMR is ready!');

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('✅ HMR Updated!');
  });
}

// Add your app code here
function render() {
  console.log('Rendering app...');
}

render();
