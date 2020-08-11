# Fixes

## Sadow DOM

Initial Shadow DOM usage is implemented in [Move CodeMirror HTML tree and related CSS to shadow DOM](https://github.com/jupyterlab/jupyterlab/pull/8584)  

```
- f7b7ee7d271bd1233a5b95c9fd9dfb2d9509bbe6
  - Move CodeMirror HTML tree and related CSS to shadow DOM
  - Sun Jul 26 05:33:10 2020 -0500
- 1f15fcbc577517f1f320252bbe0a7b5a48f32996
  - Merge pull request #8642 from saulshanabrook/2.2-changelog
  - Fri Jul 24 16:14:11 2020 -0400
```

We compare `f7b7ee7` vs `1f15fcb` and find that Shadow DOM made switching notebooks slightly faster in Chrome and slightly slower in Firefox.

![](images/f7b7ee7d271bd1233a5b95c9fd9dfb2d9509bbe6.png "")
