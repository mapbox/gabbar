# Skeleton of a CLI

import click

import gabbar


@click.command('gabbar')
@click.argument('count', type=int, metavar='N')
def cli(count):
    """Echo a value `N` number of times"""
    for i in range(count):
        click.echo(gabbar.has_legs)
