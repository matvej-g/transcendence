<?php
// PHP part
$pageTitle = "Pong Game";
$initialData = [
  'gameMode' => null,
  'timestamp' => time()
];
?>

<!-- HTML Part -->
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $pageTitle; ?></title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 min-h-screen flex items-center justify-center">
  <div id="app" class="text-center">
    <!-- Initial Play Button -->
    <div id="mainMenu" class="space-y-8">
      <h1 class="text-6xl font-bold text-white mb-12">PONG</h1>
      <button 
        id="playButton"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg text-2xl transition-all transform hover:scale-105">
        PLAY
      </button>
    </div>

    <!-- Game Mode Selection -->
    <div id="gameModeMenu" class="hidden space-y-6">
      <h2 class="text-4xl font-bold text-white mb-8">Choose Game Mode</h2>
      <div class="flex flex-col gap-4">
        <button 
            id="playLocalButton"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105">
            Play Local
        </button>
        <button 
            id="playRemoteButton"
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105">
            Play vs Player
        </button>
        <button 
            id="backButton"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-8 rounded-lg text-lg transition-all mt-4">
            Back
        </button>
      </div>
    </div>
  </div>

  <!-- SSR DATA, json_encode wandelt PHP-Array/Objekt in ein JSON string um -->
  <script>
      window.initialData = <?php echo json_encode($initialData); ?>;
  </script>

  <!-- WICHTIG: Dein kompiliertes TypeScript -->
  <script type="module" src="assets/main.js"></script>

</body>
</html>