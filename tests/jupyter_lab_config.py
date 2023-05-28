import getpass
from tempfile import mkdtemp

use_jupyter_server = True
try:
    import jupyterlab
    major = jupyterlab.__version__.split('.', maxsplit=1)[0]
    use_jupyter_server = int(major) >= 3
    MainApp = c.ServerApp if use_jupyter_server else c.NotebookApp
except ImportError:
    MainApp = c.ServerApp

# Test if we are running in a docker
if getpass.getuser() == "jovyan":
    MainApp.ip = "0.0.0.0"

MainApp.port = 9999
MainApp.open_browser = False

if use_jupyter_server:
    c.ServerApp.root_dir = mkdtemp(prefix='benchmarks-lab-')
else:
    c.ContentsManager.root_dir = mkdtemp(prefix='benchmarks-lab-')

MainApp.token = ""
MainApp.password = ""
MainApp.disable_check_xsrf = True

c.LabApp.dev_mode = True
c.LabApp.extensions_in_dev_mode = True
c.LabApp.expose_app_in_browser = True
c.LabApp.skip_dev_build = True

c.RetroApp.expose_app_in_browser = True

