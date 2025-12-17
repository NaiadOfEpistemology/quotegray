export async function hashCode(code) {
    const msgUint8=new TextEncoder().encode(code)
    const hashBuffer=await crypto.subtle.digest("SHA-256", msgUint8)
    const hashArray=Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }