import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
export interface CartItem { id:string; productId:number; productVariantId:number; name:string; title?:string; price:number; image?:string; color?:string; storage?:string; connectivity?:string; quantity:number }
export const useCartStore=defineStore('cart',()=>{
 const items=ref<CartItem[]>([])
 const cartItems=computed(()=>items.value)
 const totalItems=computed(()=>items.value.reduce((t,i)=>t+i.quantity,0))
 const totalPrice=computed(()=>items.value.reduce((t,i)=>t+Number(i.price)*i.quantity,0))
 const addToCart=(product:CartItem)=>{ if(!product?.productVariantId)return false; const e=items.value.find(i=>i.productVariantId===product.productVariantId); if(e)e.quantity+=Math.max(1,Number(product.quantity)||1); else items.value.push({...product,quantity:Math.max(1,Number(product.quantity)||1),price:Number(product.price)||0}); return true }
 const increaseQuantity=(id:string)=>{const i=items.value.find(x=>x.id===id);if(i)i.quantity++}
 const decreaseQuantity=(id:string)=>{const i=items.value.find(x=>x.id===id);if(!i)return;if(i.quantity>1)i.quantity--;else removeFromCart(id)}
 const removeFromCart=(id:string)=>{items.value=items.value.filter(i=>i.id!==id)}
 const clearCart=()=>{items.value=[]}
 return {items,cartItems,totalItems,totalPrice,addToCart,increaseQuantity,decreaseQuantity,removeFromCart,clearCart}
})
