<script lang="ts">
  import { qrcode } from "../lib/qrcode.js"

  let isDropHover = false;
  let data = null;
  let corrLvl: number = 0;

  $: imgUrl = function(): string {
      var lvl = "L";
      
      switch (corrLvl) {
        case 1:
          "M";
        case 2:
          "Q";
        case 3:
          "H";
        default:
          "L";
      }

      var code = qrcode(0, lvl);
      code.addData("KEKW!");
      code.make();
      return code.createDataURL();
    }


    function handleDrop(event: DragEvent){
      //TODO implement
    }

    function handleUpload(){
      //TODO implement
    }
</script>

<div class="flex flex-col p-5 items-center">
  <div class="flex w-96 h-96 pb-5 justify-center">
    {#if data != null}
      <!--  show QR-Code   -->
      <img src={ imgUrl() } alt="generated Code">  

      <div class="flex flex-row">
        <button> save  </button>
        <button> print </button>
        <button> reset </button>
      </div>

    {:else}
      <!--  show drag and drop field  -->
      <div on:drop|preventDefault={handleDrop} on:dragover|preventDefault on:dragenter={() =>{ isDropHover = true;}} on:dragleave={() =>{ isDropHover = false}} class="bg-zinc-300 w-full h-full rounded-md drop-shadow-xl flex flex-col justify-center"> 
        {#if !isDropHover}
        <p class="relative top-1/3 font-extrabold text-2xl text-center self-center">⬆️ drop your file ⬆️ <br> here to generate a code </p>
        <p class="relative top-1/3 font-light text-sm text-center self-center text-gray-800"> or click to choose a file </p>
        <input type="file" class="cursor-pointer w-full h-full opacity-0">
        {/if}
      </div>
    {/if}
  </div>
    
  <div class="bg-zinc-100 rounded-md drop-shadow-xl">
    <div class="bg-zinc-200 rounded-md">
      <p class="font-medium text-center" title="determins the amount of space used for error correction higher = less data"> current correction level: { corrLvl } </p>
      <div class="flex flex-row">
        <p class="p-3"> min </p>
        <input type="range" min="0" max="3" bind:value={ corrLvl }>
        <p class="p-3"> max </p>
      </div>
    </div> 
  </div>
</div>