# Skeleton of a CLI

import click

import autovandal


@click.command('autovandal')
@click.argument('count', type=int, metavar='N')
def cli(count):
    """Echo a value `N` number of times"""
    for i in range(count):
        click.echo(autovandal.has_legs)
