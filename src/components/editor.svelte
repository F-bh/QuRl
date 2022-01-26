<script lang="ts">
  import { globals } from "svelte/internal";

  import { qrcode } from "../lib/qrcode.js"

  let files: FileList;
  let data: string;
  let isDropHover: boolean = false;
  let corrLvl: number = 0;
  let url: string = "https://quri.de/";

  //TODO check file size and inform user if file would be too big
  $: imgUrl = function(): string {
      let lvl = "L";

      switch (corrLvl) {
        case 1:
          lvl = "M";
          break;
        case 2:
          lvl = "Q";
          break;
        case 3:
          lvl = "H";
          break;
        default:
          lvl = "L";
          break;
      }

      let code = qrcode(0, lvl);
      code.addData(url + data);
      code.make();
      return code.createDataURL();
    }


    //TODO inform the user that only a single file is allowed on Drag and drop
    //TODO save fileType information
    $: {
      let reader: FileReader = new globals.FileReader()

      if (files && files.length === 1){      
        reader.readAsBinaryString(files.item(0));
        
        reader.onload = () => {
          data = btoa(reader.result as string);
        };
        //TODO inform user an error has occured
        reader.onerror = () => {return;};
      }
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
      <div on:drop|preventDefault={ (event) => files = event.dataTransfer.files } on:dragover|preventDefault on:dragenter={() =>{ isDropHover = true;}} on:dragleave={() =>{ isDropHover = false}} class="bg-zinc-300 w-full h-full rounded-md drop-shadow-xl flex flex-col justify-center"> 
        {#if !isDropHover}
        <p class="relative top-1/3 font-extrabold text-2xl text-center self-center">⬆️ drop your file ⬆️ <br> here to generate a code </p>
        <p class="relative top-1/3 font-light text-sm text-center self-center text-gray-800"> or click to choose a file </p>
        <input bind:files type="file" class="cursor-pointer w-full h-full opacity-0">
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