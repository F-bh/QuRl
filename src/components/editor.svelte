<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { qrcode } from "../lib/qrcode.js";
  import pako from "../../node_modules/pako";

  export let printState: boolean = false;

  // allows us to send events to parent node
  let dispatch = createEventDispatcher();

  enum DataExceptionMsg{
    multiple = "multiple files", //val: none
    size = "too big", // val: number
    none = "no file" // val: none
  }

  class DataException{
    //should probably check if msg matches val type
    constructor(msg: DataExceptionMsg, val: any){
        this.msg = msg;
        this.val = val;
    }
    readonly msg: DataExceptionMsg
    readonly val: any //determined by the message
  }

  const URL: string = "https://quri.de/";
  const URLSIZE: number = new Blob([URL]).size; 

  //correction level to bytes allowed
  const MAXFILESIZES: Map<number, number> = new Map([[0, 2364 - URLSIZE], [1, 1867 - URLSIZE], [2, 1332 - URLSIZE], [3, 1002 - URLSIZE]]);

  let files: FileList;
  let errorMessage: string = null;
  let isDropHover: boolean = false;
  let corrLvl: number = 0;
  let compressionEnabled: boolean = true;
  let loading: boolean = false;
  let imgUrl: string = null;
  let fileName: string = null;
 
  function reset(){
    errorMessage = null;
    imgUrl = null;
    isDropHover = false;
    files = null;
    loading = false;
    fileName = null;
  }

  $:{
    corrLvl;
    compressionEnabled;
    files;
    fileName;
    if (files != null && errorMessage == null){
      generateUrl();
    }
  }

  async function generateUrl() {
      loading = true;

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
      try{
        let [data,filename] = await getData();
        if (fileName == null){
          fileName = filename;
        }
        
        code.addData(compressionEnabled ? `${URL}c/${data}/${fileName}` : `${URL}${data}/${fileName}`);
      }
      catch(e){
        let msg = e["msg"]
        switch (msg){
          case DataExceptionMsg.multiple:
            alert("at the moment only the creation of a code for a single file is supported")
            reset();
            break;
          case DataExceptionMsg.size :
            errorMessage = `🛑🛑\nThe given file is too large.\nYou could try enabling or disabling compression\nand reducing the correction level.\nYour filesize: ${e["val"]}kb\nmax. allowed filesize: ${MAXFILESIZES.get(corrLvl)}kb\n🛑🛑`
            break;
        }
        loading = false;
        return;
      }
      try{
        code.make();
      }
      catch(e){
        let sizesInBytes = e.slice(23, e.length-2).split('>');
        errorMessage = `🛑🛑\nThe given file is too large.\nYou could try enabling or disabling compression and\nreducing the correction level.\nYour filesize: ${sizesInBytes[0]/10000}kb\nmax. allowed filesize: ${sizesInBytes[1]/1000}kb\n🛑🛑`
        loading = false;
        return;
      }
      errorMessage = null;
      loading = false;
      imgUrl = code.createDataURL();
    }

  function getData(): Promise<[data: string, filename:string]>{
    if (files && files.length == 1){ 
      let reader = new FileReader();
      let name = files[0].name;
      if (compressionEnabled == true){
        return new Promise ((resolve, _) => {
          reader.onload = () => {
            let buf: Uint8Array = new Uint8Array(reader.result as ArrayBuffer); //TODO inform user an error has occured
            let compressed: Uint8Array = pako.deflate(buf);
            resolve([btoa(compressed.toString()), name]);
          }
          reader.readAsArrayBuffer(files.item(0));
        });
      }
      else{
        //check filesize and throw an error if it is too large
        if(MAXFILESIZES.get(corrLvl) < files[0].size){
          throw new DataException(DataExceptionMsg.size, files[0].size)
        }
        else{
          return new Promise((resolve, _) => {
            reader.onload = () =>{
              resolve([btoa(reader.result as string), name]);
            }
          reader.readAsBinaryString(files.item(0));
          });
        }
      }
    }
    else if(files && files.length > 1){
      throw new DataException(DataExceptionMsg.multiple, null);
    }
    else{
      throw new DataException(DataExceptionMsg.none, null);
    }
  }
</script>

<div class="flex flex-col p-5 items-center">
  <div class="flex flex-col w-96 h-96 pb-5 justify-center">
    {#if loading && errorMessage == null}
      <div class={"bg-zinc-200 w-full h-full rounded-md drop-shadow-xl p-3 flex flex-col items-center justify-center"}>
        <img class="p-10" src="src/public/static/loading_grid.svg" alt="loading">
        <p> loading please wait </p>
      </div>
    {:else if !loading && errorMessage == null && imgUrl != null}
      <img src={ imgUrl } alt="generated Code for {fileName}">
      {#if printState}
      <p class="text-center"> {fileName} </p>
      {/if}
    {:else if errorMessage != null}
      <div class="bg-zinc-300 w-full h-full rounded-md drop-shadow-xl flex p-3">
        <p class="text-red-500 text-center self-center">
        {#each errorMessage.split("\n") as paragraph}
            {paragraph} <br>
        {/each}
        </p>
      </div>
    {:else}
      <div on:drop|preventDefault={ (event) => files = event.dataTransfer.files } on:dragover|preventDefault on:dragenter={() =>{ isDropHover = true;}} on:dragleave={() =>{ isDropHover = false}} class="bg-zinc-300 w-full h-full rounded-md drop-shadow-xl flex flex-col justify-center"> 
        {#if !isDropHover}
        <p class="relative top-1/3 font-extrabold text-2xl text-center self-center">⬆️ drop your file ⬆️ <br> here to generate a code </p>
        <p class="relative top-1/3 font-light text-sm text-center self-center text-gray-800"> or click to choose a file </p>
        <input bind:files type="file" class="cursor-pointer w-full h-full opacity-0">
        {/if}
      </div>
    {/if}
  </div>

  {#if !printState }
    {#if imgUrl != null || !loading && errorMessage != null}
      <div class="flex flex-row pb-5">
        {#if errorMessage == null}
          <button on:click={() =>{dispatch("print", true)}} class="m-3 pb-2 pt-2 pl-5 pr-5 bg-lime-400 rounded-2xl"> print </button>
        {/if}
        {#if errorMessage != null}
          <button on:click={() => {errorMessage = null; generateUrl()}} class="m-3 pb-2 pt-2 pl-5 pr-5 bg-sky-400 rounded-2xl"> apply changes </button>
        {/if}
        <button on:click={reset} class="m-3 pb-2 pt-2 pl-5 pr-5 bg-red-400 rounded-2xl"> reset </button>
      </div>
    {/if}
      
    <div class="bg-zinc-100 rounded-md drop-shadow-xl flex flex-col p-5">
      <p class="font-extrabold m-3 text-center text-xl"> settings </p>
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
      
      {#if fileName != null}
        <div class="bg-zinc-200 rounded-md p-2 mt-3">
          <p class="font-medium text-center" title="determins the amount of space used for the file name, shorter = less data"> current size of the file name: { new Blob([fileName]).size } bytes </p>
          <div class="flex flex-row justify-center">
            <input bind:value={fileName} type="text" class="mt-3 bg-slate-100 rounded-md p-1">
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>