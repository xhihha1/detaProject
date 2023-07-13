class AlertMessages extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({
        mode: 'open'
      });
    }
  
    connectedCallback() {
      const _self = this;
      const label = this.getAttribute('label') || '';
      const template = document.createElement('template');
      template.innerHTML = `
        <style>
          .alert {
            position: relative;
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            background-color: #FF5E5E;
            color: white;
            opacity: 1;
            transition: opacity 0.6s;
            margin-bottom: 5px;
            border-radius: 5px;
          }
          
          .alert.success {background-color: #95E1D3;}
          .alert.info {background-color: #E6E6E6;}
          .alert.warning {background-color: #FCE38A;}
          
          .closebtn {
            margin-left: 15px;
            color: white;
            font-weight: bold;
            float: right;
            font-size: 22px;
            line-height: 20px;
            cursor: pointer;
            transition: 0.3s;
          }
          
          .closebtn:hover {
            color: black;
          }
        </style>
        <div class="alert ${label}">
          <span class="closebtn">&times;</span>  
          <strong></strong> <slot></slot>
        </div>
      `;
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.shadowRoot.querySelector('div').onclick = function(e){
        var div = e.target.parentElement;
        div.style.opacity = "0";
        setTimeout(function(){
          div.style.display = "none";
          _self.parentNode.removeChild(_self)
        }, 600);
      }
      setTimeout(function(){
        _self.parentNode.removeChild(_self)
      }, 5000);
    }
  }
  
  // 將 MyButton 導出到全局命名空間中
  if (typeof window !== 'undefined') {
    window.AlertMessages = AlertMessages;
    window.customElements.define('alert-messages', AlertMessages);
  }
  // export default NavBar;