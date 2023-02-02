class PlatziReactive {
    // Dependencias
    deps = new Map();
  
    /*
      options:
        data() => { ... }
    */
        data() {
            return {
                message: "Hola Platzi",
                image: "https://www.manejandodatos.es/wp-content/uploads/2018/02/vueJS.png"
            };
        }      
    constructor({ data }) {
      this.origen = data();
  
      const self = this;
  
      // Destino
      this.$data = new Proxy(this.origen, {
        get(target, name) {
          /* if (name in target) {
            return target[name];
          } */
          if (Reflect.has(target, name)) {
            self.track(target, name);
            return Reflect.get(target, name);
          }
          console.warn("La propiedad", name, "no existe");
          return "";
        },
        set(target, name, value) {
          Reflect.set(target, name, value);
          self.trigger(name);
        }
      });
    }
  
    track(target, name) {
      if (!this.deps.has(name)) {
        const effect = () => {
          document.querySelectorAll(`*[p-text=${name}]`).forEach(el => {
            this.pText(el, target, name);
          });
        };
        this.deps.set(name, effect);
      }
    }
    trigger(name) {
      const effect = this.deps.get(name);
      effect();
    }
  
    mount() {
      document.querySelectorAll("*[p-text]").forEach(el => {
        this.pText(el, this.$data, el.getAttribute("p-text"));

        document.querySelectorAll('*[p-bind]').forEach(Element => {
            let Atributo = Element.getAttribute('p-bind').split(':')[0];
            let Valor = Element.getAttribute('p-bind').split(':')[1];
            
            this.pBind(Element, this.$data, Atributo, Valor)
        });
      });
  
      document.querySelectorAll("*[p-model]").forEach(el => {
        const name = el.getAttribute("p-model");
        this.pModel(el, this.$data, name);
  
        el.addEventListener("input", () => {
          Reflect.set(this.$data, name, el.value);
        });
      });
    }
  
    pBind(element, origin, attribute, value) {
        element.setAttribute(attribute, Reflect.get(origin, value));
    }
    pText(el, target, name) {
      el.innerText = Reflect.get(target, name);
    }
  
    pModel(el, target, name) {
      el.value = Reflect.get(target, name);
    }
  }
  
  var Platzi = {
    createApp(options) {
      return new PlatziReactive(options);
    }
  };