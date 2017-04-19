from click.testing import CliRunner

from gabbar.scripts.cli import cli


def test_cli_count():
    runner = CliRunner()
    result = runner.invoke(cli, ['47734592'])
    assert result.exit_code == 0
    assert result.output == "Good\n"
