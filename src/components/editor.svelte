<script lang="ts">
  import { qrcode } from "../lib/qrcode.js";
  import pako from "../../node_modules/pako";

  let files: FileList;
  let data: string;
  let isDropHover: boolean = false;
  let corrLvl: number = 0;
  let url: string = "https://quri.de/";
  let compressionEnabled: boolean = true;

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
      if (files && files.length === 1){  
        let reader = new FileReader();            
        if (compressionEnabled == true){
          reader.onload = () => {
            let buf: Uint8Array = new Uint8Array(reader.result as ArrayBuffer); //TODO inform user an error has occured
            let compressed: Uint8Array = pako.deflate(buf);
            data = btoa(compressed.toString());
          }
          reader.readAsArrayBuffer(files.item(0));
        }
        else{
          reader.onload = () =>{
            data = btoa(reader.result as string);
          }
          reader.readAsBinaryString(files.item(0));
        }
      }
    }
  
</script>

<div class="flex flex-col p-5 items-center">
  <div class="flex flex-col w-96 h-96 pb-5 justify-center">
    {#if data != null}
      <!--  show QR-Code   -->
      <img src={ imgUrl() } alt="generated Code">  
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

  {#if data != null}
    <div class="flex flex-row pb-5">
      <button class="m-3 pb-2 pt-2 pl-5 pr-5 bg-lime-400 rounded-2xl"> save  </button>
      <button class="m-3 pb-2 pt-2 pl-5 pr-5 bg-yellow-400 rounded-2xl"> print </button>
      <button on:click={() => {data = null; files = null;}} class="m-3 pb-2 pt-2 pl-5 pr-5 bg-red-400 rounded-2xl"> reset </button>
    </div>
  {/if}
    
  <div class="bg-zinc-100 rounded-md drop-shadow-xl flex flex-col p-5">
    
    <div class="bg-zinc-200 rounded-md p-2">
      <p class="font-medium text-center" title="determins the amount of space used for error correction higher = less data"> current correction level: { corrLvl } </p>
      <div class="flex flex-row justify-center">
        <p class="p-3"> min </p>
        <input type="range" min="0" max="3" bind:value={ corrLvl }>
        <p class="p-3"> max </p>
      </div>
    </div>
    
    <div class="bg-zinc-200 grid grid-cols-2 rounded-md mt-3 p-2">
        <div class="p-3 self-center">
          <p> enable file compression</p>
          <p class="text-xs font-light"> may increase the size of very small files </p>
        </div>
        <input class="p-3 m-5 h-5 w-5 justify-self-end self-center" type="checkbox" bind:checked={ compressionEnabled }>
    </div> 
  </div>

</div>