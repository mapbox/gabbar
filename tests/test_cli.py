from click.testing import CliRunner

from gabbar.scripts.cli import get_prediction


def cli_count():
    # NOTE: Don't know a good way to do this test. Skipping it temporarily.
    runner = CliRunner()
    result = runner.invoke(cli, ['--changeset', '47734592'])
    assert result.exit_code == 0
    assert result.output == "Changeset http://www.openstreetmap.org/changeset/47734592 looks good.\n"
