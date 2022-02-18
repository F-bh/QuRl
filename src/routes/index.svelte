<script lang="ts">
  import Editor from "../components/editor.svelte";
  import Navbar from "../components/navbar.svelte";

  let printState = false
  function print(): void{
    printState = true;
    //wait to allow svelte to rerender before printing
    setTimeout(() => {
      window.print();
      printState = false;
    }, 10)
  } 
   


</script>

<Navbar {printState}/>
<Editor {printState} on:print={print}/>