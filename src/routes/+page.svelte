<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // export let show = false;
  export let show = true;
  const dispatch = createEventDispatcher();

  async function closeModal() {
    console.log('=--------cloese------------');
    localStorage.setItem('dbv-welcome-seen', 'true');

    try {
      // Send confirmation to server
      const response = await fetch('welcome/jwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'welcome_confirmed'
        })
      });
      
      if (!response.ok) throw new Error('Failed to confirm');
      console.log('Confirmation sent successfully');
    } catch (error) {
      console.error('Error sending confirmation:', error);
    }


    dispatch('close');
  }

  function handleKey(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter') {
      closeModal();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });
</script>

{#if show}
<div 
  transition:fade={{ duration: 300 }}
  class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4"
>
  <div
    transition:fly={{ y: 30, duration: 400, easing: cubicOut }}
    class="relative w-full max-w-5xl h-[75vh] bg-no-repeat bg-cover bg-center rounded-3xl shadow-[0_25px_50px_-12px_rgba(109,_40,_217,_0.25)] overflow-hidden border border-purple-500/30"
    style="background-image: url('/Poster2.png')"
  >
    <!-- Optional darker overlay -->
    <div class="absolute inset-0 bg-black/50 z-0"></div>

    <!-- Close button -->
    <button
      on:click={closeModal}
      class="absolute top-4 right-4 z-10 p-2 rounded-full bg-purple-900/50 hover:bg-purple-700 transition-colors backdrop-blur-sm"
      aria-label="Close welcome modal"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="relative z-10 p-6 md:p-14 flex flex-col items-center">
      <!-- Animated title - reduced size for mobile -->
      <h2 class="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-100 drop-shadow-lg">
        Welcome to  New DBV 
      </h2>

      <!-- Feature grid - reduced padding and gap for mobile -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10 w-full">
        <div class="flex items-start gap-3 p-3 md:p-5 bg-purple-900/30 rounded-xl backdrop-blur-sm border border-purple-700/30">
          <div class="bg-purple-600 p-2 md:p-3 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-bold text-white mb-1">New Categories</h3>
            <p class="text-sm md:text-base text-purple-200">Added all new cosmetics and tradeables</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 md:p-5 bg-purple-900/30 rounded-xl backdrop-blur-sm border border-purple-700/30">
          <div class="bg-purple-600 p-2 md:p-3 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-bold text-white mb-1">DBV - Deathball Tournaments</h3>
            <p class="text-sm md:text-base text-purple-200">Coming soon!</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 md:p-5 bg-purple-900/30 rounded-xl backdrop-blur-sm border border-purple-700/30">
          <div class="bg-purple-600 p-2 md:p-3 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-bold text-white mb-1">Optimizations</h3>
            <p class="text-sm md:text-base text-purple-200">Reduced lag</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 md:p-5 bg-purple-900/30 rounded-xl backdrop-blur-sm border border-purple-700/30">
          <div class="bg-purple-600 p-2 md:p-3 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-bold text-white mb-1">UI Refresh</h3>
            <p class="text-sm md:text-base text-purple-200">Cleaner, more intuitive interface</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <button
        on:click={closeModal}
        class="relative w-full max-w-md py-3 md:py-4 px-6 md:px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all rounded-xl text-white text-base md:text-lg font-semibold shadow-lg group overflow-hidden"
      >
        <span class="relative z-10 flex items-center justify-center gap-2">
          ✨ Enter the New Realm
        </span>
        <span class="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </div>
  </div>
</div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out;
  }
</style>