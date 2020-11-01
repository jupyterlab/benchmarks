if ('IntersectionObserver' in window) {
  this._observer = new IntersectionObserver(
    (entries, observer) => {
    entries.forEach(o => {
      if (o.isIntersecting) {
        observer.unobserve(o.target);
        const ci = this._toRenderMap.get(o.target.id);
        if (ci) {
            const { cell, index } = ci;
            this._renderPlaceholderCell(cell, index);
        }
      }
    });
    },
    {
    root: this.node,
    threshold: 1,
    rootMargin: `
      ${this.notebookConfig.observedTopMargin} 
      0px 
      ${this.notebookConfig.observedBottomMargin} 
      0px`
    }
  );
}
