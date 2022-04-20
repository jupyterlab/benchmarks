# import io
# import logging
# from tempfile import mkdtemp
# import pytest
# from jupyter_server.serverapp import ServerApp
# from jupyterlab.labapp import LabApp
# from traitlets.config import Config


# @pytest.fixture(scope="session")
# def jupyterlab_server():
#     ServerApp.clear_instance()
#     c = Config()
#     c.NotebookNotary.db_file = ":memory:"
#     c.setdefault(
#         "ServerApp", Config()
#     )
#     c.setdefault("LabApp", Config())
#     c.ServerApp.port = 9999
#     c.ServerApp.open_browser = False

#     c.ServerApp.root_dir = mkdtemp(prefix='markdown-parser-lab-')

#     c.ServerApp.token = ""
#     c.ServerApp.password = ""
#     c.ServerApp.disable_check_xsrf = True

#     # c.LabApp.dev_mode = True
#     # c.LabApp.extensions_in_dev_mode = True
#     c.LabApp.expose_app_in_browser = True

#     server_app = ServerApp.instance(log_level="DEBUG", config=c)

#     server_app.init_signal = lambda: None
#     server_app.log.propagate = True
#     server_app.log.handlers = []

#     server_app.initialize(argv=[], new_httpserver=False)
#     # Reroute all logging StreamHandlers away from stdin/stdout since pytest hijacks
#     # these streams and closes them at unfortunate times.
#     stream_handlers = [
#         h for h in server_app.log.handlers if isinstance(h, logging.StreamHandler)
#     ]
#     for handler in stream_handlers:
#         handler.setStream(io.StringIO())
#     server_app.log.propagate = True
#     server_app.log.handlers = []
#     # Start app without ioloop
#     server_app.start_app()

#     labapp = LabApp()
#     labapp._link_jupyter_server_extension(server_app)
#     labapp.initialize()
#     yield labapp
#     server_app.remove_server_info_file()
#     server_app.remove_browser_open_files()
